import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import world from '../../public/data/world-110m.json';
import { countryMappings } from '../utils/countryMappings';

const WorldMap = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
      const data = await response.json();
      drawMap(data.countries);
    };

    fetchData();
  }, []);

  const drawMap = (countriesData) => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;

    svg.attr('width', width).attr('height', height);

    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const maxFilms = d3.max(Object.values(countriesData));
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxFilms]);

    const worldData = topojson.feature(world, world.objects.countries);

    svg.selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const russianName = Object.keys(countryMappings).find(
          key => countryMappings[key] === d.properties.name
        );
        return russianName && countriesData[russianName] 
          ? colorScale(countriesData[russianName]) 
          : '#eee';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function(event, d) {
        const countryEng = d.properties.name;
        const russianName = Object.keys(countryMappings).find(
          key => countryMappings[key] === countryEng
        );
        
        if (russianName && countriesData[russianName]) {
          d3.select(this).attr('stroke', '#000').attr('stroke-width', 2);
          
          tooltip
            .style('opacity', 1)
            .html(`
              <div>
                <strong>${russianName}</strong>
                <div>Фильмов: ${countriesData[russianName]}</div>
              </div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        }
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 0.5);
        tooltip.style('opacity', 0);
      });

    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, ${height - 200})`);

    const legendScale = d3.scaleLinear()
      .domain([0, maxFilms])
      .range([0, 100]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format('d'));

    legend.append('g')
      .call(legendAxis);

    legend.selectAll('.legend-color')
      .data(d3.range(0, maxFilms, maxFilms / 10))
      .enter()
      .append('rect')
      .attr('x', -20)
      .attr('y', d => 100 - legendScale(d))
      .attr('width', 20)
      .attr('height', d => legendScale(d) / 10)
      .attr('fill', d => colorScale(d));
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '4px',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s',
          zIndex: 10
        }}
      ></div>
    </div>
  );
};

export default WorldMap;