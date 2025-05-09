import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import world from '../../public/data/world-110m.json';
import { countryMappings } from '../utils/countryMappings';
import './SliderMap.css';

const MAX_FILMS_FOR_SCALE = 50;
const MIN_YEAR = 1939;
const MAX_YEAR = 2025;
const INTER_YEAR = 1982;
const USSR_END_YEAR = 1991;

const SliderMap = () => {
  const svgRef = useRef();
  const sliderRef = useRef();
  const tooltipRef = useRef();
  const [currentYear, setCurrentYear] = useState(INTER_YEAR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataCache, setDataCache] = useState({});
  const [showGuide, setShowGuide] = useState(false);

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowGuide(true);
          localStorage.setItem('sliderGuideShown', 'true');
          setTimeout(() => setShowGuide(false), 1200);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (showGuide) {
      const wiggleSlider = async () => {
        const original = currentYear;
        const left = INTER_YEAR - 10;
        const right = INTER_YEAR + 10;

        const stepDuration = 30;
        const steps = 10;

        const smoothStep = async (start, end) => {
          const delta = (end - start) / steps;
          for (let i = 1; i <= steps; i++) {
            setCurrentYear(Math.round(start + delta * i));
            await new Promise(res => setTimeout(res, stepDuration));
          }
        };

        await smoothStep(original, left);
        await smoothStep(left, right);
        await smoothStep(right, original);
    
        };
  
      wiggleSlider();
    }
  }, [showGuide]);

  const processCountriesData = (rawData, year) => {
    const result = {};
    for (const [country, value] of Object.entries(rawData)) {
      const entry = result[country] || { count: 0, top_genre: 'Драма' };
      entry.count += value.count;
      result[country] = entry;
    }

    console.log(result);

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
      if (!response.ok) throw new Error('Data upload error');

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

        const value = countriesData[displayName]?.count;
        return value !== undefined
          ? getColorScale()(Math.min(value, MAX_FILMS_FOR_SCALE))
          : '#eee';
      });

    svg.selectAll('path.country')
      .on('mouseover', function(event, d) {
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
                <p>Films: ${countryData.count ?? 'N/A'}</p>
              </div>
            `)
            .style('left', '20px')
            .style('bottom', '20px');
        }
      })
      .on('mouseout', function() {
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
      .attr('stroke-width', 0.5)
      .on('mouseout', function () {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5);
        d3.select(tooltipRef.current).style('opacity', 0);
      });

    const legend = mapGroup.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 40}, ${height - 250})`);

    const legendScale = d3.scaleLinear()
      .domain([0, MAX_FILMS_FOR_SCALE])
      .range([0, 100]);

    legend.append('g')
      .call(d3.axisRight(legendScale).ticks(5).tickFormat(d3.format('d')));

    legend.selectAll('rect')
      .data(d3.range(0, MAX_FILMS_FOR_SCALE, MAX_FILMS_FOR_SCALE / 10))
      .enter()
      .append('rect')
      .attr('x', -20)
      .attr('y', d => 100 - legendScale(d))
      .attr('width', 20)
      .attr('height', d => legendScale(d) / 10)
      .attr('fill', d => getColorScale()(d));
  };

  const getColorScale = () => {
    return d3.scaleSequential(d3.interpolateBlues)
      .domain([0, MAX_FILMS_FOR_SCALE]);
  };

  return (
      <div className="map-container">
        {error && <div className="error-message">{error}</div>}

        {showGuide && <div className="overlay" onClick={() => setShowGuide(false)} />}
  
        <div className="slider-container" ref={sliderRef}>
          {showGuide && (
            <div className="slider-guide" onClick={() => setShowGuide(false)}>
              Move the slider left or right to change the year
            </div>
          )}

          <div className="year-display">
            {'Films before ' + currentYear}
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

export default SliderMap;