import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import useMovies from '../../hooks/useMovies';

export default function LineChart() {
  const { movies, loading, error } = useMovies();
  const svgRef = useRef();

  useEffect(() => {
    if (loading || error || !movies) return;

    // Подготовка данных
    const data = movies
      .filter(m => m?.details?.['Год производства'] && m?.details?.['Рейтинг'])
      .map(m => ({
        year: parseInt(m.details['Год производства']),
        rating: parseFloat(m.details['Рейтинг']),
        title: m.details['Название'] || 'Без названия'
      }))
      .sort((a, b) => a.year - b.year);

    if (data.length === 0) return;

    // Настройки графика
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .html('') // Очищаем SVG
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Шкалы
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width])
      .nice();

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.rating) + 1])
      .range([height, 0])
      .nice();

    // Линия графика
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.rating))
      .curve(d3.curveMonotoneX); // Сглаживание

    // Оси
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Собственно график
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4e79a7')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Точки данных
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.rating))
      .attr('r', 5)
      .attr('fill', '#4e79a7')
      .on('mouseover', (event, d) => {
        d3.select(event.target).attr('r', 8).attr('fill', '#e15759');
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', x(d.year) + 10)
          .attr('y', y(d.rating) - 10)
          .text(`${d.title} (${d.year}): ${d.rating}`)
          .attr('font-size', '12px')
          .attr('fill', '#333');
      })
      .on('mouseout', (event) => {
        d3.select(event.target).attr('r', 5).attr('fill', '#4e79a7');
        svg.selectAll('.tooltip').remove();
      });

    // Подписи осей
    svg.append('text')
      .attr('transform', `translate(${width/2}, ${height + margin.top + 20})`)
      .style('text-anchor', 'middle')
      .text('Год выпуска');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height/2)
      .style('text-anchor', 'middle')
      .text('Рейтинг');

  }, [movies, loading, error]);

  if (loading) return <div className="loading">Data downloading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;
  if (!movies) return <div className="no-data">No data to display</div>;

  return (
    <div className="chart-container">
      <h2>Films rated over the years</h2>
      <svg ref={svgRef} className="line-chart" />
    </div>
  );
}