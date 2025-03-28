import json
import re
from collections import Counter
from pymorphy3 import MorphAnalyzer
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from tqdm import tqdm
import numpy as np
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

morph = MorphAnalyzer()

stopwords = {"фильм", "очень", "это", "который", "весь", "быть", "этот"}

def preprocess_text(text):
    text = re.sub(r'[^\w\s]', '', text.lower())
    return ' '.join(
        morph.parse(word)[0].normal_form
        for word in text.split()
        if word not in stopwords and len(word) > 3
    )

def extract_keywords(texts, top_n=15):
    vectorizer = TfidfVectorizer(max_features=top_n)
    processed = [preprocess_text(t) for t in texts]
    vectorizer.fit_transform(processed)
    return vectorizer.get_feature_names_out().tolist()

model_name = "blanchefort/rubert-base-cased-sentiment"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

weights = {
        'POSITIVE': {
            'strong': 1.0,
            'weak': 0.7
        },
        'NEUTRAL': {
            'positive_tilt': 0.2,
            'pure': 0.0,
            'negative_tilt': -0.2
        },
        'NEGATIVE': {
            'weak': -0.7,
            'strong': -1.0
        }
}

def get_emotion_weight(label, score):
    if label == 'POSITIVE':
        # Усиленная сигмоида с быстрым ростом после 0.6
        return 0.5 + 0.5 * (1 / (1 + np.exp(-12*(score - 0.65))))
    elif label == 'NEGATIVE':
        # Аналогично для негатива
        return -0.5 - 0.5 * (1 / (1 + np.exp(-12*(score - 0.65))))
    else:
        # Более выраженный переход для нейтральных
        if score > 0.5:
            return 0.3 * (2*(score - 0.5)) ** 0.7  # Быстрый выход на плато
        else:
            return -0.3 * (2*(0.5 - score)) ** 0.7
def enhanced_analyze_sentiment(texts):

    sentiment_scores = []
    
    for text in texts:
        try:
            inputs = tokenizer(text[:512], return_tensors="pt", truncation=True)
            with torch.no_grad():
                logits = model(**inputs).logits[0]
            
            probs = torch.nn.functional.softmax(logits, dim=-1).numpy()
            class_names = model.config.id2label
            
            sorted_indices = np.argsort(probs)[::-1]
            top3 = [
                {"label": class_names[i], "score": float(probs[i]), "weight": get_emotion_weight(class_names[i], float(probs[i]))} 
                for i in sorted_indices[:3]
            ]
            
            # Dynamical coefficients of influence
            confidence = top3[0]['score'] - top3[1]['score']  # Confidence degree in prime emotion
            secondary_coef = 0.5 - 0.4 * confidence  # 0.1-0.5
            tertiary_coef = 0.2 - 0.15 * confidence  # 0.05-0.2
            
            primary = top3[0]['weight'] * (top3[0]['score'] ** 0.85)
            secondary = top3[1]['weight'] * (top3[1]['score'] ** 0.85) * secondary_coef
            tertiary = top3[2]['weight'] * (top3[2]['score'] ** 0.85) * tertiary_coef
            
            final_score = np.clip(primary + secondary + tertiary, -1, 1)

            sentiment_scores.append(final_score)
            
        except Exception as e:
            print(f"Ошибка при обработке текста: {str(e)}")
    
    return sentiment_scores

def softmax_aggregate(sentiments, temperature=1.0):

    scaled = np.array(sentiments) + 1
    
    z = scaled / temperature
    
    exp_z = np.exp(z - np.max(z))
    weights = exp_z / np.sum(exp_z)
    
    return np.sum(sentiments * weights)

def complex_estimation(sentiments):
    if not sentiments:
        return {"error": "No valid sentiment data"}
    
    mean = np.mean(sentiments)
    median = np.median(sentiments)
    std = np.std(sentiments)
    total = len(sentiments)
    
    # Sentiment distribution
    dist = {
        'strong_positive': sum(s > 0.7 for s in sentiments),
        'weak_positive': sum(0.15 < s <= 0.7 for s in sentiments),
        'neutral': sum(-0.15 <= s <= 0.15 for s in sentiments),
        'weak_negative': sum(-0.7 <= s < -0.15 for s in sentiments),
        'strong_negative': sum(s < -0.7 for s in sentiments)
    }
    ratios = {k: v/total for k,v in dist.items()}

    film_type = "undefined"

    if (mean > 0.7 and ratios['strong_positive'] > 0.8):
        film_type = "universal_acclaim"

    elif (mean > -0.1 and ratios['strong_negative'] > 0.3):
        film_type = "hidden_controversy"

    elif (ratios['strong_positive'] > 0.3 and ratios['strong_negative'] > 0.3):
        film_type = "polarizing"
    
    elif (mean < 0 and ratios['weak_positive'] > 0.4):
        film_type = "underwhelming"

    elif (abs(mean) < 0.2 and ratios['neutral'] > 0.6):
        film_type = "solid_average"

    elif (dist['strong_positive'] > 0 and dist['strong_negative'] > 0 and std > 0.75):
        film_type = "divisive"

    elif (0.2 < mean < 0.5 and ratios['weak_positive'] > 0.5):
        film_type = "mildly_positive"

    if film_type == "undefined":
        if std < 0.3:
            film_type = "consistent_reception"
        elif median > mean + 0.3:
            film_type = "positive_outliers"
        elif median < mean - 0.3:
            film_type = "negative_outliers"
    
    return {
        'mean_sentiment': round(mean, 3),
        'median_sentiment': round(median, 3),
        'std_deviation': round(std, 3),
        'distribution_ratios': {k: round(v, 3) for k,v in ratios.items()},
        'film_type': film_type
    }

# Film type explanations
FILM_TYPE_DESCRIPTIONS = {
    "universal_acclaim": "Overwhelming positive reception from all audiences",
    "hidden_controversy": "Generally neutral/mild scores but with passionate haters",
    "polarizing": "Strongly divided between love and hate",
    "underwhelming": "Disappointing compared to expectations",
    "solid_average": "Neither remarkable nor terrible",
    "divisive": "Extreme opinions on both ends",
    "mildly_positive": "Generally liked but few strong supporters",
    "consistent_reception": "Opinions cluster closely together",
    "positive_outliers": "Few extremely positive reviews inflate average",
    "negative_outliers": "Few extremely negative reviews drag down average"
}

def process_reviews(reviews):

    texts = [reviews[i] for i in range(len(reviews)) if len(reviews[i]) > 100]
    sentiments = enhanced_analyze_sentiment(texts)
    return {
        "keywords": extract_keywords(texts),
        "softmax": softmax_aggregate(sentiments),
        **complex_estimation(sentiments),
        "total_reviews": len(texts),
        "sentiments": sentiments
    }

def optimize_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for movie in tqdm(data, desc="Film data processing"):
        if "Рецензии 100 зрителей" in movie["details"]:
            analysis = process_reviews(movie["details"]["Рецензии 100 зрителей"])
            movie["details"]["Анализ_рецензий"] = analysis
            del movie["details"]["Рецензии 100 зрителей"]
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    optimize_file("data/cleaned_data.json", "data/optimized_data.json")