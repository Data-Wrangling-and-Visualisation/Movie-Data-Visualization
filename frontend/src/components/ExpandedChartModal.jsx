import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ExpandedChartModal = ({ chartType, data, onClose }) => {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = {top: 50, right: 50, bottom: 100, left: 80};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Анимация появления осей
    const xAxisGroup = chart.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .attr("opacity", 0);
    
    const yAxisGroup = chart.append("g")
      .attr("opacity", 0);

    // Логика для разных типов графиков
    switch(chartType) {
      case 'year': {
        // Фильтрация лет (каждый 5-й год)
        const years = Object.keys(data).sort();
        const filteredYears = years.filter((_, i) => i % 5 === 0 || i === years.length - 1);

        const x = d3.scaleBand()
          .domain(years)
          .range([0, innerWidth])
          .padding(0.2);
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(Object.values(data))])
          .range([innerHeight, 0]);

        xAxisGroup.call(d3.axisBottom(x).tickValues(filteredYears))
          .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        yAxisGroup.call(d3.axisLeft(y));

        // Bars animation
        chart.selectAll(".bar")
          .data(Object.entries(data))
          .enter()
          .append("rect")
            .attr("class", "chart-bar")
            .attr("x", d => x(d[0]))
            .attr("y", innerHeight)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .transition()
            .delay((d, i) => i * 50)
            .duration(500)
            .attr("y", d => y(d[1]))
            .attr("height", d => innerHeight - y(d[1]));
        break;
      }

      case 'boxoffice': {
        // Сумма сборов
        const sumData = Object.entries(data).map(([range, count]) => {
          const [min, max] = range.split('-').map(Number);
          const avg = (min + max) / 2;
          return [range, avg * count];
        });

        const x = d3.scaleBand()
          .domain(Object.keys(data))
          .range([0, innerWidth])
          .padding(0.2);
        
        const y = d3.scaleLog()
          .domain([1, d3.max(sumData.map(d => d[1]))])
          .range([innerHeight, 0]);

        xAxisGroup.call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        yAxisGroup.call(d3.axisLeft(y));

        // Line animation
        const line = d3.line()
          .x(d => x(d[0]) + x.bandwidth() / 2)
          .y(d => y(d[1]));
        
        chart.append("path")
          .datum(sumData)
          .attr("class", "chart-line")
          .attr("d", line)
          .attr("stroke-dasharray", function() { return this.getTotalLength(); })
          .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
          .attr("stroke-width", 4)
          .attr("fill", "none")
          .transition()
          .duration(2000)
          .attr("stroke-dashoffset", 0);
        break;
      }

      case 'rating': {
        const filteredData = Object.entries(data)
          .filter(([key]) => {
            const [min] = key.split('-').map(Number);
            return min >= 7.0;
          })
          .sort((a, b) => a[0].localeCompare(b[0]));

        const xTicks = filteredData
          .map(([key]) => key)
          .filter((_, i) => i % 3 === 0);

        const x = d3.scaleBand()
          .domain(filteredData.map(d => d[0]))
          .range([0, innerWidth])
          .padding(0.2);
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(filteredData.map(d => d[1]))])
          .range([innerHeight, 0]);

        xAxisGroup.call(d3.axisBottom(x).tickValues(xTicks));
        yAxisGroup.call(d3.axisLeft(y));

        // Line animation
        const line = d3.line()
          .x(d => x(d[0]) + x.bandwidth() / 2)
          .y(d => y(d[1]));
        
        chart.append("path")
          .datum(filteredData)
          .attr("class", "chart-line")
          .attr("d", line)
          .attr("stroke-dasharray", function() { return this.getTotalLength(); })
          .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
          .attr("stroke-width", 4)
          .attr("fill", "none")
          .transition()
          .duration(2000)
          .attr("stroke-dashoffset", 0);
        break;
      }

      case 'genre': {
        const sortedData = Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        const x = d3.scaleBand()
          .domain(sortedData.map(d => d[0]))
          .range([0, innerWidth])
          .padding(0.2);
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(sortedData.map(d => d[1]))])
          .range([innerHeight, 0]);

        xAxisGroup.call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        yAxisGroup.call(d3.axisLeft(y));

        // Bars animation
        chart.selectAll(".bar")
          .data(sortedData)
          .enter()
          .append("rect")
            .attr("class", "chart-bar")
            .attr("x", d => x(d[0]))
            .attr("y", innerHeight)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .transition()
            .delay((d, i) => i * 100)
            .duration(600)
            .attr("y", d => y(d[1]))
            .attr("height", d => innerHeight - y(d[1]));
        break;
      }
    }

    // Анимация появления осей
    xAxisGroup.transition().duration(500).attr("opacity", 1);
    yAxisGroup.transition().duration(500).attr("opacity", 1);

    // Заголовок
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "300")
      .text(getChartTitle(chartType));

  }, [data, chartType]);

  const getChartTitle = (type) => {
    switch(type) {
      case 'year': return 'Movies by Year';
      case 'boxoffice': return 'Box Office Revenue Distribution';
      case 'rating': return 'Rating Distribution';
      case 'genre': return 'Top 10 Genres';
      default: return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <svg ref={svgRef} width="800" height="600" viewBox="0 0 800 600" />
      </div>
    </div>
  );
};

export default ExpandedChartModal;