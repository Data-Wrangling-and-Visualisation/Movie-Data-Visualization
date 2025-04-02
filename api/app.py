from flask import Flask, jsonify, make_response
from flask_restful import Resource, Api
from flask_cors import CORS
import json
import os

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
        """Returns movie statistics for films up to the given year"""
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
            
            # Обработка стран (учитываем что страна может быть "Россия, США")
            for movie in filtered_movies:
                countries = [c.strip() for c in movie['details']['Страна'].split(",")]
                for country in countries:
                    if country:  # Игнорируем пустые значения
                        stats['countries'][country] = stats['countries'].get(country, 0) + 1
            
            # Обработка жанров
            for movie in filtered_movies:
                genres = [g.strip() for g in movie['details']['Жанр'].split(",")]
                for genre in genres:
                    if genre:  # Игнорируем пустые значения
                        stats['genres'][genre] = stats['genres'].get(genre, 0) + 1
            
            return jsonify(stats)
            
        except Exception as e:
            return {"error": f"Server error: {str(e)}"}, 500


api.add_resource(StatsByYear, '/api/stats/<int:end_year>')
api.add_resource(Movies, '/api/movies')
api.add_resource(Movie, '/api/movies/<int:movie_id>')
api.add_resource(MoviesByCountry, '/api/movies/country/<string:country>')
api.add_resource(MoviesByGenre, '/api/movies/genre/<string:genre>')
api.add_resource(Stats, '/api/stats')

if __name__ == '__main__':
    app.run(debug=True)