import pandas as pd
import json
from currency_converter import CurrencyConverter
import requests
import re


c = CurrencyConverter()


def load_and_process_data(file_path):
    """Loads data from JSON file, processes, and returns a DataFrame."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list):
            data = [data]

        unique_data = set()
        processed_data = []

        for item in data:
            title = item.get("title")
            url = item.get("url")
            details = item.get("details", {})

            identifier = (title, url)

            if identifier not in unique_data:
                unique_data.add(identifier)

                new_item = {"title": title, "url": url, "details": details}
                processed_data.append(new_item)

        df = pd.DataFrame(processed_data)
        return df

    except Exception as e:
        print(f"Error loading or processing data: {str(e)}")
        return None


def clean_dataframe(df):
    """Cleans and transforms a DataFrame, working on 'details' but preserving other structure."""

    def process_details(details):
        """Process details dictionary without modifying during iteration"""
        keys_to_process = list(details.keys())  # Create static list of keys
        modified = {}

        for key in keys_to_process:
            value = details[key]
            if isinstance(value, str):
                value = clean_text(value)

            if key == "Сборы в мире":
                modified["Сборы в мире $"] = extract_last_revenue(value)
            elif key == "Сборы в США":
                modified["Сборы в США $"] = clean_revenue(value)
            elif key == "Сборы в России":
                modified["Сборы в России $"] = clean_revenue(value)
            elif key == "Бюджет":
                value_usd = convert_to_usd(value)
                if value_usd:
                    modified["Бюджет $"] = value_usd
                else:
                    modified["Бюджет $"] = value

            elif key == "Зрители":
                    viewers = process_viewers(value)
                    if viewers is not None:
                        modified["Зрители"] = viewers
                    else:
                        modified["Зрители"] = value

            elif key == "Рецензии 100 зрителей":
                modified[key] = clean_reviews(value)
            elif key == "Актеры":
                modified[key] = clean_list(value)
            elif key == "Маркетинг":
                modified[key] = clean_revenue(value)
            elif key in ["Премьера в России", "Премьера в мире", "Релиз на DVD", "Релиз на Blu-ray", "Ре-релиз (РФ)"]:
                modified[key] = format_date(extract_date(value))
            elif key == "Время":
                minutes = convert_to_minutes(value)
                if minutes is not None:
                    modified["Время в минутах"] = str(minutes)
                else:
                    modified["Время в минутах"] = value
            elif key == "Топ 250":
                modified[key] = clean_revenue(value).replace("место", "")

            elif key == "Оценок":
                number = extract_number(value)
                if number is not None:
                    modified["Количество оценок"] = str(number)
                else:
                    modified["Количество оценок"] = None
            elif isinstance(value, str):
                modified[key] = clean_text(value)
            elif isinstance(value, list):
                modified[key] = clean_list(value)
            else:
                modified[key] = clean_numeric(value)

        return modified

    def clean_text(text):
        """Removes whitespace, extra spaces, trailing ellipsis (...), and trailing comma with optional space."""
        if isinstance(text, str):
            cleaned_text = " ".join(text.strip().split())
            cleaned_text = re.sub(r"[,]\s*$", "", cleaned_text)
            cleaned_text = cleaned_text.replace("...", "")
            return cleaned_text
        return text

    def convert_to_usd(value):
        """Converts other currencies to USD using live exchange rates from an API."""
        if isinstance(value, str):
            try:
                currency_match = re.search(r"^[A-Za-z]+", value)
                if currency_match:
                    currency = currency_match.group(0).upper()
                    amount_str = value[len(currency):].strip()
                    amount = float(amount_str.replace(" ", ""))

                    if currency == "USD":
                        return f"${amount:,.0f}"

                    api_url = f"https://api.exchangerate.host/convert?from={currency}&to=USD"
                    response = requests.get(api_url)
                    data = response.json()

                    if response.status_code == 200 and data.get("success"):
                        rate = data["result"]
                        amount_usd = amount * rate
                        return f"${amount_usd:,.0f}"
                    else:
                        print(f"API error for {currency}: {data.get('error') or 'Unknown error'}")
                        return value
                else:
                    return value
            except Exception as e:
                print(f"Conversion error: {e}")
                return value
        return value

    def clean_list(data_list):
        """Cleans whitespace from items in list and removes empty strings."""
        if isinstance(data_list, list):
            return [clean_text(item) for item in data_list if isinstance(item, str) and clean_text(item)]
        return data_list

    def clean_numeric(value):
        """Converts to numeric, removing extra characters."""
        if isinstance(value, str):
            value = value.replace('$', '').replace(',', '')
        try:
            return pd.to_numeric(value, errors='coerce')
        except:
            return value

    def extract_last_revenue(revenue_string):
        """Extracts the last revenue number from a string and formats it."""
        if isinstance(revenue_string, str):
            match = re.search(r"= ([$][\d\s]+)", revenue_string)
            if match:
                revenue_number = match.group(1)
            else:
                match = re.search(r"[$][\d\s]+", revenue_string)
                if match:
                    revenue_number = match.group(0)
                else:
                    return None

            revenue_number = revenue_number.replace(" ", "")

            if revenue_number.startswith("$"):
                revenue_number = revenue_number[1:]

            return revenue_number

        return None

    def clean_revenue(revenue_string):
        """Removes spaces and the first dollar sign from a revenue string."""
        if isinstance(revenue_string, str):
            revenue_string = revenue_string.replace(" ", "")
            if revenue_string.startswith("$"):
                revenue_string = revenue_string[1:]
            return revenue_string
        return revenue_string

    def extract_number(ratings_string):
        """Extracts the number from the string and returns it as an integer."""
        if isinstance(ratings_string, str):
            number_str = re.sub(r"[^\d]", "", ratings_string)

            try:
                return int(number_str)
            except ValueError:
                return None
        return None

    def format_number(number):
        """Formats a number with spaces for better readability."""
        if isinstance(number, (int, float)):
            return re.sub(r"(\d)(?=(\d{3})+(?!\d))", r"\1 ", str(int(number)))
        return number

    def get_currency_rates(api_key):
        """Gets current exchange rates."""
        url = f"https://api.freecurrencyapi.com/v1/latest?apikey={api_key}&currencies=EUR,USD,CAD,RUB"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            return data["data"]
        else:
            print(f"Error fetching exchange rates. Status code: {response.status_code}")
            return None

    def convert_to_usd(value):
        """Converts an amount to US Dollars."""
        if isinstance(value, str):
            currency_code_match = re.search(r"[A-Za-z₽€$]", value)

            if currency_code_match:
                currency_code = currency_code_match.group(0)

                if currency_code == '₽':
                    currency_code = 'RUB'
                elif currency_code == '€':
                    currency_code = 'EUR'
                elif currency_code == '$':
                    amount = float(re.sub(r'[^\d.,]', '', value).replace(',', '.'))
                    return f"{int(amount)}"
                elif currency_code == 'F':  #  (FRF)
                    amount = float(re.sub(r'[^\d.,]', '', value).replace(',', '.'))
                    amount_usd = amount * 0.16  #  1 FRF ≈ 0.16 USD
                    return f"{int(amount_usd)}"  #
                elif currency_code == 'D':  #  (DEM)
                    amount = float(re.sub(r'[^\d.,]', '', value).replace(',', '.'))
                    amount_usd = amount * 0.57  # 1 DEM ≈ 0.57 USD
                    return f"{int(amount_usd)}"

                amount = float(re.sub(r'[^\d.,]', '', value).replace(',', '.'))

                # API
                api_key = "fca_live_FPy01EU43KCw6Oq4FUtAFqedXOSqJbyfqbbviQAp"
                rates = get_currency_rates(api_key)

                if rates and currency_code in rates:
                    conversion_rate = rates[currency_code]
                    amount_usd = amount / conversion_rate
                    return f"{int(amount_usd)}"
                else:
                    print(f"Currency {currency_code} not supported by this API.")
                    return None
            else:
                return "Unable to determine currency"

        return value

    def process_viewers(viewers_string):
        """Converts viewers string to full number."""
        if isinstance(viewers_string, str):
            viewers_string = viewers_string.replace(" ", "")
            if "тыс" in viewers_string:
                number_str = viewers_string.replace("тыс", "")
                try:
                    number = float(number_str) * 1000
                    return int(number)
                except ValueError:
                    return None
            elif "млн" in viewers_string:
                number_str = viewers_string.replace("млн", "")
                try:
                    number = float(number_str) * 1000000
                    return int(number)
                except ValueError:
                    return None
            else:
                try:
                    return int(float(viewers_string))
                except ValueError:
                    return None
        return None

    def clean_reviews(reviews):
        """Clean and remove duplicates from reviews."""
        if isinstance(reviews, list):
            cleaned_reviews = []
            seen = set()
            for review in reviews:
                cleaned_review = clean_text(review)
                if cleaned_review and cleaned_review not in seen:
                    cleaned_reviews.append(cleaned_review)
                    seen.add(cleaned_review)
            return cleaned_reviews
        return reviews

    def extract_date(date_string):
        """Extracts the date, month, and year from the string and returns them as integers."""
        if isinstance(date_string, str):
            try:
                parts = date_string.split(',')
                date_part = parts[0].strip()

                date_parts = date_part.split()
                if len(date_parts) >= 3:
                    day = int(date_parts[0])
                    month_str = date_parts[1]
                    year = int(date_parts[2])

                    month_dict = {
                        "января": 1, "февраля": 2, "марта": 3, "апреля": 4,
                        "мая": 5, "июня": 6, "июля": 7, "августа": 8,
                        "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12
                    }
                    month = month_dict.get(month_str.lower())

                    return {"day": day, "month": month, "year": year}
                else:
                    return None
            except ValueError:
                return None
        return None

    def format_date(date_dict):
        """Formats the date dictionary to DD.MM.YYYY format."""
        if isinstance(date_dict, dict) and "day" in date_dict and "month" in date_dict and "year" in date_dict:
            day = date_dict["day"]
            month = date_dict["month"]
            year = date_dict["year"]
            return f"{day:02d}.{month:02d}.{year}"
        return None

    def convert_to_minutes(time_string):
        """Converts time string (e.g., "1 ч 52 мин") to total minutes."""
        if isinstance(time_string, str):
            match = re.match(r"(\d+)\s*ч\s*(\d+)\s*мин", time_string)
            if match:
                hours = int(match.group(1))
                minutes = int(match.group(2))
                total_minutes = hours * 60 + minutes
                return total_minutes
        return None

    for index, row in df.iterrows():
        details = row['details'].copy()
        cleaned_details = process_details(details)
        df.at[index, 'details'] = cleaned_details

    return df


def save_cleaned_data_to_json(df, output_file="../data/cleaned_data.json"):
    """Saves the cleaned DataFrame back to a JSON file, preserving structure and handling NaN values."""
    if df is not None:
        try:
            df_cleaned = df.where(pd.notnull(df), None)

            data_list = df_cleaned.to_dict(orient='records')

            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data_list, f, indent=4, ensure_ascii=False)

            print(f"Cleaned data saved to {output_file}")
        except Exception as e:
            print(f"Error saving cleaned data to JSON file: {str(e)}")
    else:
        print("No data to save.")


# Main Execution
if __name__ == "__main__":
    input_file = "../data/movies_final.json"
    cleaned_df = load_and_process_data(input_file)

    if cleaned_df is not None:
        cleaned_df = clean_dataframe(cleaned_df)
        save_cleaned_data_to_json(cleaned_df)
