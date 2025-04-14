import { useD3 } from '../../hooks/useD3';
import * as d3 from 'd3';

const RatingChart = ({ data, onExpand }) => {
  const ref = useD3(
    (svg) => {
      if (!data || Object.keys(data).length === 0) return;

      const margin = {top: 30, right: 30, bottom: 100, left: 60};
      const width = 500 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const filteredData = Object.entries(data)
        .filter(([key]) => {
          const [min] = key.split('-').map(Number);
          return min >= 7.0;
        })
        .sort((a, b) => a[0].localeCompare(b[0]));

      // X axis
      const x = d3.scaleBand()
        .domain(filteredData.map(d => d[0]))
        .range([0, width])
        .padding(0.2);
      
      const xAxis = chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .style("font-size", "10px")
        .filter((d, i) => {
          const [min] = d.split('-').map(Number);
          return min % 0.3 === 0;
        });

      const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData.map(d => d[1]))])
        .range([height, 0]);
      
      chart.append("g")
        .call(d3.axisLeft(y));

      const line = d3.line()
        .x(d => x(d[0]) + x.bandwidth() / 2)
        .y(d => y(d[1]));
      
      chart.append("path")
        .datum(filteredData)
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
    <div className="chart-container rating-chart" onClick={onExpand}>
      <h3 className="chart-title">Rating Distribution</h3>
      <svg 
        ref={ref} 
        className="chart-svg" 
        viewBox="0 0 500 400"
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};

export default RatingChart;