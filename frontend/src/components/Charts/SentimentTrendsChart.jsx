import React from "react";
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

export default function SentimentTrendsChart({ movies }) {

  const sorted = movies
    .map(movie => {
      const details = movie.details;
      const total = +details["Количество рецензий от зрителей"];
      const pos = +details["Количество положительных рецензий от зрителей"];
      const neu = +details["Количество нейтральных рецензий от зрителей"];
      const neg = +details["Количество отрицательных рецензий от зрителей"];
      const rating = +details["Рейтинг"];

      return {
        rating,
        positiveRatio: pos / total || 0,
        neutralRatio: neu / total || 0,
        negativeRatio: neg / total || 0
      };
    })
    .filter(entry => !isNaN(entry.rating))
    .sort((a, b) => a.rating - b.rating);

  const labels = sorted.map((_, index) => index + 1);

  const data = {
    labels,
    datasets: [
      {
        label: "Positive",
        data: sorted.map(d => d.positiveRatio),
        borderColor: "#0066cc",
        backgroundColor: "rgba(115, 152, 220, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: "Neutral",
        data: sorted.map(d => d.neutralRatio),
        borderColor: "#9e9e9e",
        backgroundColor: "rgba(158, 158, 158, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: "Negative",
        data: sorted.map(d => d.negativeRatio),
        borderColor: "#f44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          callback: value => `${value * 100}%`
        },
        title: {
          display: true,
          text: "% of all reviews"
        }
      },
      x: {
        display: false
      }
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Sentiment distribution of movies reviews
      </h2>
      <Line data={data} options={options} />
    </div>
  );
}
