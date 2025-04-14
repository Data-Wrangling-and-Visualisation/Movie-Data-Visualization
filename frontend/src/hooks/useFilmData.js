import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useMovies() {
  const [movies, setMovies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/movies`)
      .then((res) => {
        console.log('Recieved data:', res.data);
        setMovies(res.data);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { movies, loading, error };
}