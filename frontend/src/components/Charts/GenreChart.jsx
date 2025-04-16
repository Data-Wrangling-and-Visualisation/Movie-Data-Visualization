import { useD3 } from '../../hooks/useD3';
import * as d3 from 'd3';

const GenreChart = ({ data, onExpand }) => {
  const ref = useD3(
    (svg) => {
      if (!data || Object.keys(data).length === 0) return;

      const margin = {top: 30, right: 30, bottom: 70, left: 60};
      const width = 500 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const sortedData = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      // X axis
      const x = d3.scaleBand()
        .domain(sortedData.map(d => d[0]))
        .range([0, width])
        .padding(0.2);
      
      chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

      // Y axis
      const y = d3.scaleLinear()
        .domain([0, d3.max(sortedData.map(d => d[1]))])
        .range([height, 0]);
      
      chart.append("g")
        .call(d3.axisLeft(y));

      // Bars with animation
      chart.selectAll(".bar")
        .data(sortedData)
        .enter()
        .append("rect")
          .attr("class", "chart-bar")
          .attr("x", d => x(d[0]))
          .attr("y", height)
          .attr("width", x.bandwidth())
          .attr("height", 0)
          .attr("rx", 4)
          .attr("ry", 4)
          .transition()
          .duration(800)
          .attr("y", d => y(d[1]))
          .attr("height", d => height - y(d[1]));
    },
    [data]
  );

  return (
    <div 
      className="chart-container genre-chart"
      onClick={onExpand}
    >
      <h3 className="chart-title">Top 10 Genres</h3>
      <svg 
        ref={ref}
        className="chart-svg"
        viewBox="0 0 500 400"
      />
    </div>
  );
};

export default GenreChart;