import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function StdDevChart({ movies }) {
  // Группируем по жанрам
  const genreData = {};

  movies.forEach((movie) => {
    const genres = movie.details["Жанр"].split(",");
    const sentiments = movie.details["Анализ_рецензий"]?.sentiments;

    if (!genres|| !sentiments || sentiments.length === 0) return;

    genres.map((genre) => {

      if (!genreData[genre]) {
        genreData[genre] = [];
      }
  
      genreData[genre].push(...sentiments);

    });
    
  });

  // Вычисляем стандартное отклонение
  const genres = Object.keys(genreData);
  const stdDevs = genres.map((genre) => {
    const sentiments = genreData[genre];
    const mean = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentiments.length;
    return Math.sqrt(variance);
  });

  const data = {
    labels: genres,
    datasets: [
      {
        label: "Reviews tonality standart deviation",
        data: stdDevs,
        fill: true,
        borderColor: "#0066cc",
        backgroundColor: "rgba(115, 152, 220, 0.2)",
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2
      },
    ],
  };

  // Настройки графика
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: context => `Std.: ${context.parsed.y.toFixed(3)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Standard Deviation",
        },
      },
      x: {
        title: {
          display: true,
          text: "Genres",
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }} className="sentiment-vis-text">
        Standart deviation for review tonality
      </h2>
      <Line data={data} options={options} />
    </div>
  );
}
