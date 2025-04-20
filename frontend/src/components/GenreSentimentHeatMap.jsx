import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { Chart } from "react-chartjs-2";

// Регистрируем всё нужное
ChartJS.register(
  MatrixController,
  MatrixElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function GenreSentimentHeatmap({ movies }) {
  const genreSentimentData = useMemo(() => {
    const genreMap = {};

    movies.forEach(movie => {
      const genres = movie.details["Жанр"]?.split(",").map(g => g.trim()) || [];
      const sentiments = movie.details?.Анализ_рецензий?.sentiments || [];

      if (sentiments.length === 0) return;

      const avgSentiment =
        sentiments.reduce((acc, val) => acc + val, 0) / sentiments.length;

      genres.forEach(genre => {
        if (!genreMap[genre]) genreMap[genre] = [];
        genreMap[genre].push(avgSentiment);
      });
    });

    const result = Object.entries(genreMap).map(([genre, scores]) => ({
      genre,
      average: scores.reduce((a, b) => a + b, 0) / scores.length
    }));

    return result.sort((a, b) => b.average - a.average);
  }, [movies]);

  const data = {
    datasets: [
      {
        label: "Sentiment by Genre",
        data: genreSentimentData.map((item, i) => ({
          x: 0,
          y: i,
          v: item.average
        })),
        backgroundColor(ctx) {
          const value = ctx.raw.v;
          const alpha = Math.abs(value);
          return value >= 0
            ? `rgba(0, 150, 136, ${alpha})`
            : `rgba(244, 67, 54, ${alpha})`;
        },
        borderColor: "#fff",
        borderWidth: 1,
        width: () => 100,
        height: () => 25
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false
      },
      y: {
        type: "category",
        labels: genreSentimentData.map(item => item.genre),
        offset: true,
        grid: {
          display: false
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: context => genreSentimentData[context[0].raw.y].genre,
          label: context => `Средняя тональность: ${context.raw.v.toFixed(3)}`
        }
      },
      legend: {
        display: false
      }
    }
  };

  return (
    <div style={{ height: genreSentimentData.length * 30, width: "100%", maxWidth: 600, margin: "0 auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: 20 }}>
        Heatmap: Средняя тональность по жанрам
      </h3>
      <Chart type="matrix" data={data} options={options} />
    </div>
  );
}
