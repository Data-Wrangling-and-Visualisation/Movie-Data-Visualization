import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function StripPlotByGenre({ movies }) {
  const [selectedGenre, setSelectedGenre] = useState('');

  // Собираем все жанры из фильмов, разделяя по запятой и очищая
  const genres = useMemo(() => {
    const allGenres = movies
      .flatMap((m) =>
        m.details?.Жанр?.split(',').map((g) => g.trim().toLowerCase()) || []
      );
    return Array.from(new Set(allGenres)).sort();
  }, [movies]);

  // Фильтрация фильмов по выбранному жанру
  const filteredMovies = useMemo(() => {
    if (!selectedGenre) return [];
    return movies
      .filter((m) => {
        const genreStr = m.details?.Жанр || '';
        const genreList = genreStr
          .split(',')
          .map((g) => g.trim().toLowerCase());
        return genreList.includes(selectedGenre);
      })
      .slice(0, 50);
  }, [selectedGenre, movies]);

  console.log(filteredMovies);  

  const data = useMemo(() => {
    const points = [];
    filteredMovies.forEach((movie, idx) => {
      const sentiments = movie.details?.Анализ_рецензий?.sentiments || [];
      sentiments.forEach((value) => {
        points.push({
          x: `#${idx + 1}`,
          y: value,
        });
      });
    });

    console.log(points);

    return {
      datasets: [
        {
          label: 'Value of tonality',
          data: points,
          backgroundColor: 'rgba(0, 102, 204, 0.7)',
          pointRadius: 3,
        },
      ],
    };
  }, [filteredMovies]);
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Sentiments for ${selectedGenre}`
      }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Movies'
        },
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: 'Sentiment'
        },
        min: -1,
        max: 1
      }
    }
  };
  

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: 30 }} className="sentiment-vis-text">
        Tonality distribution of movies reviews
      </h3>

      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <label>Choose the genre: </label>
        <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          <option value="">-- Genre --</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div style={{marginBottom: "10%" }}>
        {selectedGenre && <Scatter data={data} options={options} />}
      </div>
    </div>
  );
}
