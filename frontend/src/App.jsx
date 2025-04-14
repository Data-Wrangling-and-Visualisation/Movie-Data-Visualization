import { useState, useEffect } from 'react';
import './App.css';
import SliderMap from './components/SliderMap';
import SentimentRadar from './components/SentimentRadar';
import GenreWordCloud from './components/GenreWordCloud';
import CountUp from 'react-countup';
import FilmSlider from './components/FilmSlider';
import { useOnScreen } from './hooks/useOnScreen';
import AnimatedNumber from './components/AnimatedNumber';
import ExplorationSection from './components/ExplorationSection'

function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(1);
  const [activeTab, setActiveTab] = useState('map');
  const [scrolled, setScrolled] = useState(false);
  const [yearsRef, isYearsVisible] = useOnScreen({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`app ${scrolled ? 'scrolled' : ''}`}>
      <section id="main" className="cover">
        <div className={`cover-top ${scrolled ? 'scrolled' : ''}`}>
          <span className="cover-label">
            <span className="text-blue">Visualization</span> <span>project</span>
          </span>
          <nav className="header-nav">
            <a href="#main" className="nav-link">Main page</a>
            <a href="#years" className="nav-link">Over the years</a>
            <a href="#geography" className="nav-link">Geography</a>
            <a href="#genres" className="nav-link">Genres</a>
            <a href="#sentiment" className="nav-link">Sentiment</a>
          </nav>
          <a 
            href="https://t.me/mescudiway" 
            className="contact-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact us
          </a>
        </div>

        <div className="cover-content">
          <h1 className="cover-title">
            <span className="text-blue">Movie</span> <span >Data</span> <span>Analysis</span>
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
            <img src="/photos/VHS.png" alt="Film cassette" />
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

      <section id="years" className="years-section" ref={yearsRef}>
        <h2 className="section-main-title"><span className="text-blue">Movies</span> over the years</h2>
        
        <div className="years-content">
          <div className="years-text">
            <p className="years-description">
              Cinema has evolved dramatically since its inception. 
              The top 250 films represent the pinnacle of storytelling, 
              showcasing how budgets, technologies and audience tastes 
              have transformed over the decades.
            </p>
          </div>

          <div className="years-stats">
            <div className="stats-grid">
              <div className="years-stat-item">
                <AnimatedNumber 
                  value={58.7} 
                  duration={1.5} 
                  decimals={1} 
                  suffix="B" 
                  startOnView 
                  isVisible={isYearsVisible}
                />
                <div className="years-stat-label">Total worldwide box office</div>
              </div>
              
              <div className="years-stat-item">
                <AnimatedNumber 
                  value={127} 
                  duration={1.5} 
                  suffix="m" 
                  startOnView 
                  isVisible={isYearsVisible}
                />
                <div className="years-stat-label">Average budget</div>
              </div>
              
              <div className="years-stat-item">
                <AnimatedNumber 
                  value={112} 
                  duration={1.5} 
                  suffix="min" 
                  startOnView 
                  isVisible={isYearsVisible}
                />
                <div className="years-stat-label">Average runtime</div>
              </div>
              
              <div className="years-stat-item">
                <AnimatedNumber 
                  value={8.2} 
                  duration={1.5} 
                  decimals={1} 
                  startOnView 
                  isVisible={isYearsVisible}
                />
                <div className="years-stat-label">Average rating</div>
              </div>
            </div>
          </div>
        </div>
        <section id="visualizations" className="visualizations-section">
          <ExplorationSection />
        </section>
      </section>

      <section id="geography" className="geo-section">
        <header className="geo-header">
          <nav className="nav">
            <button 
              className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              Map
            </button>
            <button 
              className={`nav-btn ${activeTab === 'genres' ? 'active' : ''}`}
              onClick={() => setActiveTab('genres')}
            >
              Genres
            </button>
            <button 
              className={`nav-btn ${activeTab === 'sentiment' ? 'active' : ''}`}
              onClick={() => setActiveTab('sentiment')}
            >
              Tonality
            </button>
          </nav>
        </header>

        <main className="geography">
          {activeTab === 'map' && (
            <section className="section">
              <h2 className="section-title">
                <span className="text-blue">Cinematography</span> history
              </h2>
              <SliderMap />
            </section>
          )}

          {activeTab === 'genres' && (
            <section className="section">
              <h2 className="section-title">
                <span className="text-blue">Genre</span> palette
              </h2>
              <GenreWordCloud />
            </section>
          )}

          {activeTab === 'sentiment' && (
            <section className="section">
              <h2 className="section-title">
                <span className="text-blue">Emotional</span> spectrum
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
      </section>

      <footer className="footer">
        <p>© 2025 Kinopoisk top-250 films Analysis</p>
      </footer>
    </div>
  );
}

export default App;