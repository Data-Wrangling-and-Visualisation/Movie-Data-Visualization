import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useMovies() {
  const [movies, setMovies] = useState(null); // Начинаем с null вместо []
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/movies')
      .then((res) => {
        console.log('Данные получены:', res.data);
        setMovies(res.data);
      })
      .catch((err) => {
        console.error('Ошибка загрузки:', err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { movies, loading, error };
}