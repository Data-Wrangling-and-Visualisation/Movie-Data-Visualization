import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

export default function GenreSentimentLineChart({ movies }) {
  const genreStats = useMemo(() => {
    const genreMap = {};

    movies.forEach(movie => {
      const genres = movie.details["Жанр"]?.split(",").map(g => g.trim()) || [];
      const total = +movie.details["Количество рецензий от зрителей"];
      const pos = +movie.details["Количество положительных рецензий от зрителей"];
      const neu = +movie.details["Количество нейтральных рецензий от зрителей"];
      const neg = +movie.details["Количество отрицательных рецензий от зрителей"];

      if (!total || isNaN(total)) return;

      genres.forEach(genre => {
        if (!genreMap[genre]) {
          genreMap[genre] = { total: 0, pos: 0, neu: 0, neg: 0, count: 0 };
        }

        genreMap[genre].total += total;
        genreMap[genre].pos += pos;
        genreMap[genre].neu += neu;
        genreMap[genre].neg += neg;
        genreMap[genre].count += 1;
      });
    });

    return Object.entries(genreMap)
      .map(([genre, stats]) => ({
        genre,
        positive: stats.pos / stats.total,
        neutral: stats.neu / stats.total,
        negative: stats.neg / stats.total
      }))
      .sort((a, b) => a.genre.localeCompare(b.genre));
  }, [movies]);

  const labels = genreStats.map(g => g.genre);

  const data = {
    labels,
    datasets: [
      {
        label: "Positive",
        data: genreStats.map(g => g.positive),
        borderColor: "#0066cc",
        backgroundColor: "rgba(115, 152, 220, 0.2)",
        tension: 0.3,
        fill: true
      },
      {
        label: "Neutral",
        data: genreStats.map(g => g.neutral),
        borderColor: "#9e9e9e",
        backgroundColor: "rgba(158, 158, 158, 0.2)",
        tension: 0.3,
        fill: true
      },
      {
        label: "Negative",
        data: genreStats.map(g => g.negative),
        borderColor: "#f44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`
        }
      },
      legend: {
        position: "top"
      }
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          callback: val => `${(val * 100).toFixed(0)}%`
        },
        title: {
          display: true,
          text: "Mean % of all reviews for genre"
        }
      },
      x: {
        title: {
          display: true,
          text: "Genres"
        }
      }
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }} className="sentiment-vis-text">
        Tonality distribution for genres
      </h2>
      <div style={{marginBottom: "10%" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
