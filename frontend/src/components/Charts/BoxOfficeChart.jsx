import { useD3 } from '../../hooks/useD3';
import * as d3 from 'd3';

const BoxOfficeChart = ({ data }) => {
  const ref = useD3(
    (svg) => {
      if (!data) return;

      const margin = {top: 40, right: 30, bottom: 70, left: 80};
      const width = 500 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Преобразуем данные в логарифмические бины
      const minValue = 1e6; // 1 миллион
      const maxValue = d3.max(Object.keys(data).flatMap(range => {
        const [min, max] = range.split('-').map(Number);
        return [min, max];
      }));
      
      const logScale = d3.scaleLog()
        .domain([minValue, maxValue])
        .range([0, 1]);
      
      const bins = [];
      let current = minValue;
      while (current < maxValue) {
        const next = current * 3;
        bins.push([current, next]);
        current = next;
      }

      const binData = bins.map(([min, max]) => {
        const count = Object.entries(data).reduce((sum, [range, value]) => {
          const [rangeMin, rangeMax] = range.split('-').map(Number);
          if (rangeMin >= min && rangeMax <= max) return sum + value;
          return sum;
        }, 0);
        return [`${min/1e6}-${max/1e6}M`, count];
      });

      // X axis (логарифмические бины)
      const x = d3.scaleBand()
        .domain(binData.map(d => d[0]))
        .range([0, width])
        .padding(0.2);
      
      chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

      // Y axis (количество фильмов)
      const y = d3.scaleLinear()
        .domain([0, d3.max(binData.map(d => d[1]))])
        .range([height, 0]);
      
      chart.append("g")
        .call(d3.axisLeft(y));

      // Line with drawing animation
      const line = d3.line()
        .x(d => x(d[0]) + x.bandwidth() / 2)
        .y(d => y(d[1]));
      
      chart.append("path")
        .datum(binData)
        .attr("class", "chart-line")
        .attr("d", line)
        .attr("stroke-dasharray", function() { return this.getTotalLength(); })
        .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .transition()
        .duration(1500)
        .attr("stroke-dashoffset", 0);
    },
    [data]
  );

  return (
    <div className="chart-container box-office-chart">
      <h3 className="chart-title">Box Office Revenue (Log scale)</h3>
      <svg 
        ref={ref}
        className="chart-svg"
        viewBox="0 0 500 400"
      />
    </div>
  );
};

export default BoxOfficeChart;