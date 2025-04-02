import { useState, useEffect } from 'react';
import './App.css';
import SliderMap from './components/SliderMap';
import SentimentRadar from './components/SentimentRadar';
import GenreWordCloud from './components/GenreWordCloud';
import FilmSlider from './components/FilmSlider';
function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(1);
  const [activeTab, setActiveTab] = useState('map');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50; // Появляется после 50px скролла
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`app ${scrolled ? 'scrolled' : ''}`}>
      {/* Обложка */}
      <section className="cover">
        <div className={`cover-top ${scrolled ? 'scrolled' : ''}`}>
          <span className="cover-label">Visualization project</span>
          <span className="cover-authors">Name, Name, Name</span>
        </div>

        <div className="cover-content">
          <h1 className="cover-title">
            <span className="title-line">Movie Data Analysis</span>
          </h1>

          <div className="stats-block">
            <div className="stat-item">
              <div className="stat-number">250</div>
              <div className="stat-label">films were analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">21</div>
              <div className="stat-label">primary genres</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">8.2</div>
              <div className="stat-label">average film rating</div>
            </div>
          </div>

          <div className="film-cassette">
            <img src="/photos/titlephoto1.png" alt="Film cassette" />
          </div>
        </div>

        <p className="cover-subtitle">
          Analysis of the top 250 movies from Kinopoisk, exploring trends in budgets, revenues, ratings, and genres
        </p>

        <a 
          href="https://www.kinopoisk.ru/lists/movies/top250/" 
          className="cover-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          According to <br />Kinopoisk rating
        </a>
      </section>

      {/* Серая переходная секция */}
      <section className="transition-section">
        <h2 className="transition-title">Movies over the years</h2>
      </section>

      {/* Основной контент */}
      <header className="header">
        <div className="logo">KP250</div>
        <nav className="nav">
          <button 
            className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            Карта
          </button>
          <button 
            className={`nav-btn ${activeTab === 'genres' ? 'active' : ''}`}
            onClick={() => setActiveTab('genres')}
          >
            Жанры
          </button>
          <button 
            className={`nav-btn ${activeTab === 'sentiment' ? 'active' : ''}`}
            onClick={() => setActiveTab('sentiment')}
          >
            Тональность
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'map' && (
          <section className="section">
            <h2 className="section-title">
              <span className="text-blue">География</span> кинематографа
            </h2>
            <SliderMap />
          </section>
        )}

        {activeTab === 'genres' && (
          <section className="section">
            <h2 className="section-title">
              <span className="text-blue">Жанровая</span> палитра
            </h2>
            <GenreWordCloud />
          </section>
        )}

        {activeTab === 'sentiment' && (
          <section className="section">
            <h2 className="section-title">
              <span className="text-blue">Эмоциональный</span> ландшафт
            </h2>
            <div className="movie-selector">
              <label className="selector-label">
                Выберите фильм:
                <input
                  type="range"
                  min="1"
                  max="250"
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(parseInt(e.target.value))}
                  className="range-input"
                />
                <span className="movie-id">#{selectedMovieId}</span>
              </label>
            </div>
            <SentimentRadar movieId={selectedMovieId} />
          </section>
        )}
      </main>

      <footer className="footer">
        <p>© 2023 Kinopoisk 250 Analytics</p>
      </footer>
    </div>
  );
}

export default App;