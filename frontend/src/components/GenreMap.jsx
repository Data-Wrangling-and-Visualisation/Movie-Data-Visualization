import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import world from '../../public/data/world-110m.json';
import { countryMappings } from '../utils/countryMappings';
import './SliderMap.css';

const MIN_YEAR = 1939;
const INTER_YEAR = 1982;
const MAX_YEAR = 2025;
const USSR_END_YEAR = 1991;

const genreColors = {
  'драма': '#1f77b4',
  'комедия': '#ff7f0e',
  'триллер': '#2ca02c',
  'документальный': '#d62728',
  'боевик': '#9467bd', 
  'мелодрама': '#8c564b',
  'криминал': '#e377c2',
  'анимация': '#7f7f7f',
  'фэнтези': '#bcbd22',
  'приключения': '#17becf',
  'ужасы': '#d62728',
  'фантастика': '#9edae5',
  'история': '#c49c94',
  'военный': '#aec7e8',
  'музыка': '#f7b6d2',
  'семейный': '#c7c7c7',
  'спорт': '#dbdb8d',
  'биография': '#ff9896',
};

const getGenreColor = (genre) => genreColors[genre] || '#ccc';

const GenreMap = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [currentYear, setCurrentYear] = useState(INTER_YEAR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataCache, setDataCache] = useState({});
  const [selectedGenre, setSelectedGenre] = useState(null);


  const translateCountry = (russianName) => {
    if (currentYear <= USSR_END_YEAR && russianName === 'Россия') {
      return 'USSR';
    }
    return countryMappings[russianName] || russianName;
  };

  useEffect(() => {
    initializeMap();
    fetchData(currentYear);
  }, []);

  useEffect(() => {
    fetchData(currentYear);
  }, [currentYear]);

  useEffect(() => {
    if (dataCache[currentYear]) {
      updateMap(dataCache[currentYear], currentYear);
    }
  }, [selectedGenre]);

  const processCountriesData = (rawData, year) => {
    const result = {};
    for (const [country, value] of Object.entries(rawData)) {
      const entry = result[country] || { count: 0, top_genre: 'Драма' };
      entry.count += value.count;
      entry.top_genre = value.top_genre;
      result[country] = entry;
    }

    if (year <= USSR_END_YEAR && result['СССР']) {
      result['Россия'] = result['СССР'];
    }

    return result;
  };

  const fetchData = async (year) => {
    if (dataCache[year]) {
      updateMap(dataCache[year], year);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/${year}`);
      if (!response.ok) throw new Error('Ошибка загрузки данных');

      const data = await response.json();
      const processedData = processCountriesData(data.countries || {}, year);

      setDataCache(prev => ({ ...prev, [year]: processedData }));
      updateMap(processedData, year);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      updateMap({}, year);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMap = (countriesData, year) => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    svg.selectAll('path.country')
      .transition()
      .duration(800)
      .attr('fill', d => {
        const russianName = Object.keys(countryMappings).find(
          key => countryMappings[key] === d.properties.name
        );
        const displayName = year <= USSR_END_YEAR && russianName === 'Россия'
          ? 'СССР'
          : russianName;

        const genre = countriesData[displayName]?.top_genre;

        if (!genre) return '#eee';
        if (selectedGenre && genre !== selectedGenre) return '#ddd';

        return getGenreColor(genre);
      });

    svg.selectAll('path.country')
      .on('mouseover', function (event, d) {
        const countryEng = d.properties.name;
        let russianName = Object.keys(countryMappings).find(
          key => countryMappings[key] === countryEng
        );

        if (year <= USSR_END_YEAR && russianName === 'Россия') {
          russianName = 'СССР';
        }

        const countryData = countriesData[russianName];

        if (russianName && countryData) {
          this.parentNode.appendChild(this);

          const [[x0, y0], [x1, y1]] = d3.geoPath().bounds(d);
          const centerX = (x0 + x1) / 2;
          const centerY = (y0 + y1) / 2;

          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${centerX},${centerY}) scale(1.03) translate(${-centerX},${-centerY})`)
            .attr('filter', 'url(#highlight)');

          tooltip
            .style('opacity', 1)
            .html(`
              <div class="tooltip-content">
                <h4>${translateCountry(russianName)}</h4>
                <p>Genre: ${countryData.top_genre ?? 'N/A'}</p>
              </div>
            `)
            .style('left', '20px')
            .style('bottom', '20px');
        }
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0) scale(1)')
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .attr('filter', null);

        tooltip.style('opacity', 0);
      });
  };

  const initializeMap = () => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto');

    svg.append('defs').html(`
        <filter id="highlight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      `);

    svg.selectAll("*").remove();

    const mapGroup = svg.attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'map-container');

    mapGroup.append('text')
      .attr('class', 'year-text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold');

    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const worldData = topojson.feature(world, world.objects.countries);

    mapGroup.selectAll('path.country')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', '#eee')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5);

      const legendGroup = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, 60)`);
    
    let i = 0;
    for (const [genre, color] of Object.entries(genreColors)) {
      legendGroup.append('rect')
        .attr('x', 0)
        .attr('y', i * 22)
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', color)
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedGenre(prev => prev === genre ? null : genre);
        });
    
      legendGroup.append('text')
        .attr('x', 25)
        .attr('y', i * 22 + 14)
        .text(genre)
        .style('font-size', '12px')
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedGenre(prev => prev === genre ? null : genre);
        });
    
      i++;
    }
  };

  return (
    <div className="map-container">
      {error && <div className="error-message">{error}</div>}

      <div className="slider-container">
        <div className="year-display">
          {'Top genre before ' + currentYear}
        </div>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="year-slider"
        />
      </div>

      <svg ref={svgRef} className="map-svg"></svg>

      <div ref={tooltipRef} className="map-tooltip"></div>
    </div>
  );
};

export default GenreMap;
