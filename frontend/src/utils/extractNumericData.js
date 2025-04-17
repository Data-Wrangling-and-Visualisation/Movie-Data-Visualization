// utils/extractNumericData.js
export function extractNumericData(movies) {
    return movies.map(movie => {
      const details = movie.details;
      return {
        Budget: parseFloat(details["Бюджет $"]) || 0,
        USGross: parseFloat(details["Сборы в США $"]) || 0,
        WorldwideGross: parseFloat(details["Сборы в мире $"]) || 0,
        RussiaGross: parseFloat(details["Сборы в России $"]) || 0,
        Rating: parseFloat(details["Рейтинг"]) || 0,
        Audience: parseFloat(details["Зрители"]) || 0,
        Runtime: parseFloat(details["Время в минутах"]) || 0,
        Profit: (parseFloat(details["Сборы в мире $"]) || 0) - (parseFloat(details["Бюджет $"]) || 0),
      };
    });
  }
  