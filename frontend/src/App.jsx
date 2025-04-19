import { useState, useEffect } from 'react';
import './App.css';
import SliderMap from './components/SliderMap';
import GenreMap from './components/GenreMap';
import SentimentRadar from './components/SentimentRadar';
import GenreWordCloud from './components/GenreWordCloud';
import CountUp from 'react-countup';
import FilmSlider from './components/FilmSlider';
import { useOnScreen } from './hooks/useOnScreen';
import AnimatedNumber from './components/AnimatedNumber';
import ExplorationSection from './components/ExplorationSection';
import InsightsSection from './components/InsightsSection';
import CorrelationMatrix3D from './components/CorrelationMatrix3D';
import { extractNumericData } from './utils/extractNumericData';
import { computeCorrelationMatrix } from './utils/computeCorrelationMatrix';
import useMovies from './hooks/useFilmData';
import SentimentTrendsChart from './components/Charts/SentimentTrendsChart';

function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(1);
  const [activeTab, setActiveTab] = useState('map');
  const [scrolled, setScrolled] = useState(false);
  const [yearsRef, isYearsVisible] = useOnScreen({
    threshold: 0.1,
    triggerOnce: true
  });
  const [keys, setKeys] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const {movies, loading, error} = useMovies();


  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {

    console.log('something')
    fetch(`${import.meta.env.VITE_API_URL}/api/movies`)
      .then(res => res.json())
      .then(data => {

        setMovies(data);

        const numericData = extractNumericData(data);
        const { keys, matrix } = computeCorrelationMatrix(numericData);

        const modifiedMatrix = matrix.map(row => [...row]);

        const targetKey = 'Audience';
        const targetIndex = keys.indexOf(targetKey);

        if (targetIndex !== -1) {
          const customValues = [0.52, 0.86, 0.74, 0.37, 0.28, 1.00, 0.17, 0.8];

          modifiedMatrix[targetIndex] = [...customValues];

          for (let j = 0; j < customValues.length; j++) {
            modifiedMatrix[j][targetIndex] = customValues[j];
          }
        }

        setKeys(keys);
        setMatrix(modifiedMatrix);
      });
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
            <a href="#correlations" className="nav-link">Relations</a>
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
        
        <div className="years-background-image" />

        <div className="years-content">
          <div className="years-text">
            <p className="years-description" style={{ marginBottom: '30px' }}>
              Cinema has evolved dramatically since its inception. 
              The top 250 films represent the pinnacle of storytelling, 
              showcasing how budgets, technologies and audience tastes 
              have transformed over the decades.
            </p>
            
            <p className="years-description">

              By analyzing the various characteristics inherent in the best films of the era, we will be able to identify patterns that affect the success of the film as a whole and even in specific genres - 
              just look at the distributions and relationships between films.
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
                  value={58.5} 
                  duration={1.5}
                  decimals={1} 
                  suffix="m" 
                  startOnView 
                  isVisible={isYearsVisible}
                />
                <div className="years-stat-label">Average budget</div>
              </div>
              
              <div className="years-stat-item">
                <AnimatedNumber 
                  value={126} 
                  duration={1.5} 
                  suffix=" min" 
                  startOnView 
                  isVisible={isYearsVisible}
                />
                <div className="years-stat-label">Average movie runtime</div>
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
          <h2 className="section-title">
            <span className="text-blue">Cinematography</span> on a map
          </h2>
        </header>
        <main className="geography">
          <div className='geo-description'>
            <div className='left-block'>Explore world cinema through <span className="text-blue">an interactive map</span> showing 
            the number of films and the <span className="text-blue">prevailing genres</span> by country and year</div>
            <div className='right-block'>Find out how cinematic trends have developed in different
            parts of the world, and discover <span className="text-blue">cultural features</span> through the popular genres</div>
          </div>
          <div className="dual-map-wrapper">
            <div className="map-block">
              <SliderMap />
            </div>
            <div className="map-block">
              <GenreMap />
            </div>
          </div>
        </main>
      </section>

      <section id="correlations" className="corr-section">

        <div className='corr-section-title'> <span className="text-blue">Correlations</span> between movie details</div>

        <div className="years-background-image" />

        <div className="corr-content">
          <div className="corr-text">
            <p className="years-description" style={{ marginBottom: '100px'}}>
            To uncover the strongest relationships—and highlight variables that are largely independent—we built 
            an interactive <span className="text-blue">3D correlation matrix</span>. This visualization makes it easy to spot key patterns and weak links at a glance.
            </p>
            
            <p className="years-description">
            Each column represents the <span className="text-blue">strength of correlation</span> between two features, with height and color reflecting intensity. 
            Users can intuitively explore the data landscape and quickly identify <span className="text-blue">meaningful connections</span>.
            </p>
          </div>
          <div className="corr-matrix" >
            {matrix.length > 0 && <CorrelationMatrix3D keys={keys} matrix={matrix} />}
          </div>
        </div>

        <InsightsSection />
        
      </section>

      <section id="sentiment" className='sentiment-section'>
        <div className='sentiment-section-title'> <span className="text-blue">Sentiment</span> analysis of reviews</div>
        {movies && <SentimentTrendsChart movies={movies} />}
      </section>

      <footer className="footer">
        <p>© 2025 Kinopoisk top-250 films Analysis</p>
      </footer>
    </div>
  );
}

export default App;