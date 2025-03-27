from flask import Flask, jsonify
from flask_restful import Resource, Api
import json

app = Flask(__name__)
api = Api(app)

with open('cleaned_data.json', 'r', encoding='utf-8') as f:
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
        
        # Статистика по странам
        for movie in movies_data:
            country = movie['details']['Страна']
            stats['countries'][country] = stats['countries'].get(country, 0) + 1
        
        # Статистика по жанрам
        for movie in movies_data:
            for genre in movie['details']['Жанр'].split(', '):
                stats['genres'][genre] = stats['genres'].get(genre, 0) + 1
        
        return jsonify(stats)

# Регистрация ресурсов
api.add_resource(Movies, '/api/movies')
api.add_resource(Movie, '/api/movies/<int:movie_id>')
api.add_resource(MoviesByCountry, '/api/movies/country/<string:country>')
api.add_resource(MoviesByGenre, '/api/movies/genre/<string:genre>')
api.add_resource(Stats, '/api/stats')

if __name__ == '__main__':
    app.run(debug=True)