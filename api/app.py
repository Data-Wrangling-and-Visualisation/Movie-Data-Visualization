from flask import Flask, jsonify, make_response
from flask_restful import Resource, Api
from flask_cors import CORS
import json
import os
from collections import Counter

app = Flask(__name__)
api = Api(app)
app.config['JSON_AS_ASCII'] = False 
CORS(app)

@api.representation('application/json')
def output_json(data, code, headers=None):
    resp = make_response(
        json.dumps(data, ensure_ascii=False, indent=2), 
        code
    )
    resp.headers.extend(headers or {})
    resp.headers['Content-Type'] = 'application/json; charset=utf-8'
    return resp

JSON_PATH = os.path.join(os.path.dirname(__file__), 'data/optimized_data.json')

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    movies_data = json.load(f)

class Movies(Resource):
    def get(self):
        return jsonify(movies_data)

class Movie(Resource):
    def get(self, movie_id):
        """Returns the film by its position in the top 250 (1-250)"""
        try:
            movie = next(m for m in movies_data if int(m['details']['Топ 250']) == movie_id)
            return jsonify(movie)
        except StopIteration:
            return {"error": "Movie not found"}, 404

class MoviesByCountry(Resource):
    def get(self, country):
        """Returns movies by country of production"""
        filtered = [m for m in movies_data if country.lower() in m['details']['Страна'].lower()]
        return jsonify(filtered)

class MoviesByGenre(Resource):
    def get(self, genre):
        """Returns movies by genre"""
        filtered = [m for m in movies_data if genre.lower() in m['details']['Жанр'].lower()]
        return jsonify(filtered)

class Stats(Resource):
    def get(self):
        """Returns movie statistics"""
        stats = {
            "total_movies": len(movies_data),
            "countries": {},
            "genres": {},
            "average_rating": sum(float(m['details']['Рейтинг']) for m in movies_data) / len(movies_data)
        }
        
        for movie in movies_data:
            country = movie['details']['Страна']
            stats['countries'][country] = stats['countries'].get(country, 0) + 1
        
        for movie in movies_data:
            for genre in movie['details']['Жанр'].split(', '):
                stats['genres'][genre] = stats['genres'].get(genre, 0) + 1
        
        return jsonify(stats)

class StatsByYear(Resource):
    def get(self, end_year):
        """Returns movie statistics for films by the given year"""
        try:
            filtered_movies = [
                m for m in movies_data 
                if int(m['details']['Год производства']) <= end_year
            ]
            
            if not filtered_movies:
                return {"error": f"No movies found before {end_year}"}, 404
                
            stats = {
                "total_movies": len(filtered_movies),
                "countries": {},
                "genres": {},
                "average_rating": sum(float(m['details']['Рейтинг']) for m in filtered_movies) / len(filtered_movies)
            }

            country_genre_count = {}

            for movie in filtered_movies:
                countries = [c.strip() for c in movie['details']['Страна'].split(",")]
                genres = [g.strip() for g in movie['details']['Жанр'].split(",")]

                for country in countries:
                    if not country:
                        continue

                    stats['countries'].setdefault(country, {"count": 0, "top_genre": None})
                    stats['countries'][country]["count"] += 1

                    country_genre_count.setdefault(country, {})
                    for genre in genres:
                        if genre:
                            country_genre_count[country][genre] = country_genre_count[country].get(genre, 0) + 1

                for genre in genres:
                    if genre:
                        stats['genres'][genre] = stats['genres'].get(genre, 0) + 1

            for country, genre_counts in country_genre_count.items():
                top_genre = max(genre_counts.items(), key=lambda x: x[1])[0]
                stats['countries'][country]["top_genre"] = top_genre

            return jsonify(stats)

        except Exception as e:
            return {"error": f"Server error: {str(e)}"}, 500


@app.route('/api/charts/years')
def years_data():
    years = [movie['details']['Год производства'] for movie in movies_data]
    year_counts = Counter(years)
    return jsonify(dict(sorted(year_counts.items())))

@app.route('/api/charts/boxoffice')
def boxoffice_data():
    box_offices = []
    for movie in movies_data:
        try:
            worldwide = float(movie['details']['Сборы в мире $'])
            box_offices.append(worldwide)
        except (KeyError, ValueError):
            continue
    
    if box_offices:
        min_val = min(box_offices)
        max_val = max(box_offices)
        step = (max_val - min_val) / 30
        bins = [min_val + i*step for i in range(31)]
        
        distribution = {f"{bins[i]:.0f}-{bins[i+1]:.0f}": 0 for i in range(30)}
        for amount in box_offices:
            for i in range(30):
                if bins[i] <= amount < bins[i+1]:
                    distribution[f"{bins[i]:.0f}-{bins[i+1]:.0f}"] += 1
                    break
        return jsonify(distribution)
    return jsonify({})

@app.route('/api/charts/ratings')
def ratings_data():
    ratings = []
    for movie in movies_data:
        try:
            rating = float(movie['details']['Рейтинг'])
            ratings.append(rating)
        except (KeyError, ValueError):
            continue
    
    if ratings:
        rating_dist = {}
        for r in range(70, 101):
            raiting = r / 10
            key = f"{raiting:.1f}"
            rating_dist[key] = sum(r == raiting for r in ratings)
        rating_dist.pop('10.0')    
        return jsonify(rating_dist)
    return jsonify({})

@app.route('/api/charts/genres')
def genres_data():
    genres = []
    for movie in movies_data:
        try:
            movie_genres = [g.strip() for g in movie['details']['Жанр'].split(',')]
            genres.extend(movie_genres)
        except (KeyError, AttributeError):
            continue
    
    genre_counts = Counter(genres)
    return jsonify(dict(genre_counts.most_common(15)))

@app.route('/api/charts/durations')
def durations_data():
    durations = []
    for movie in movies_data:
        try:
            duration = int(movie['details']['Время в минутах'])
            durations.append(duration)
        except (KeyError, ValueError):
            continue
    
    if durations:
        duration_dist = {}
        for d in range(0, 301, 20):
            key = f"{d}-{d+20} min"
            duration_dist[key] = sum(d <= duration < d+20 for duration in durations)
        return jsonify(duration_dist)
    return jsonify({})          


api.add_resource(StatsByYear, '/api/stats/<int:end_year>')
api.add_resource(Movies, '/api/movies')
api.add_resource(Movie, '/api/movies/<int:movie_id>')
api.add_resource(MoviesByCountry, '/api/movies/country/<string:country>')
api.add_resource(MoviesByGenre, '/api/movies/genre/<string:genre>')
api.add_resource(Stats, '/api/stats')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)