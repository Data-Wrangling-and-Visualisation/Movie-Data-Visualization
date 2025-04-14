import { useState, useEffect, useRef } from 'react';
import YearChart from './Charts/YearChart';
import BoxOfficeChart from './Charts/BoxOfficeChart';
import RatingChart from './Charts/RatingChart';
import GenreChart from './Charts/GenreChart';
import { useVisibility } from '../hooks/useChartVisibility';

const ExplorationSection = () => {
  const [sectionRef, isSectionVisible] = useVisibility();
  const [textRef, isTextVisible] = useVisibility();
  const [chartsRef, areChartsVisible] = useVisibility();
  const [chartData, setChartData] = useState({
    years: {},
    boxOffice: {},
    ratings: {},
    genres: {}
  });

  useEffect(() => {
    if (isSectionVisible) {
      loadData();
    }
  }, [isSectionVisible]);

  const loadData = async () => {
    try {
      const responses = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/charts/years`),
        fetch(`${import.meta.env.VITE_API_URL}/api/charts/boxoffice`),
        fetch(`${import.meta.env.VITE_API_URL}/api/charts/ratings`),
        fetch(`${import.meta.env.VITE_API_URL}/api/charts/genres`)
      ]);
      
      const [years, boxOffice, ratings, genres] = await Promise.all(
        responses.map(res => res.json())
      );

      setChartData({ years, boxOffice, ratings, genres });
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="exploration-section"
    >
      <div 
        ref={textRef}
        className={`exploration-text ${areChartsVisible ? 'charts-visible' : ''}`}
      >
        Let's explore movie patterns using visualizations...
      </div>
      
      <div 
        ref={chartsRef}
        className={`visualizations-grid ${isSectionVisible ? 'visible' : ''}`}
      >
        <YearChart 
          data={chartData.years} 
        />
        <BoxOfficeChart 
          data={chartData.boxOffice} 
        />
        <RatingChart 
          data={chartData.ratings} 
        />
        <GenreChart 
          data={chartData.genres} 
        />
      </div>
    </section>
  );
};

export default ExplorationSection;