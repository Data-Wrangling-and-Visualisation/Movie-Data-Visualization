import { useD3 } from '../../hooks/useD3';
import * as d3 from 'd3';

const BoxOfficeChart = ({ data }) => {
  const ref = useD3(
    (svg) => {
      if (!data) return;

      const margin = {top: 30, right: 30, bottom: 70, left: 60};
      const width = 500 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      svg.selectAll('*').remove();

      const chart = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const formattedData = Object.entries(data)
        .map(([range, value]) => {
          const [min, max] = range.split('-').map(Number);
          return { label: `$${(min / 1e6).toFixed(0)}M–${(max / 1e6).toFixed(0)}M`, min, value };
        })
        .sort((a, b) => a.min - b.min);

      const x = d3
        .scaleBand()
        .domain(formattedData.map(d => d.label))
        .range([0, width])
        .padding(0.2);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(formattedData.map(d => d.value))])
        .range([height, 0]);

      // X axis
      chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '10px');

      // Y axis
      chart.append('g').call(d3.axisLeft(y));

      // Bars
      chart.selectAll('rect')
        .data(formattedData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.label))
        .attr('y', height)
        .attr("class", "chart-bar")
        .attr('width', x.bandwidth())
        .attr("height", 0)
        .attr('opacity', 0.8)
        .attr("rx", 4)
        .attr("ry", 4)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('y', d => y(d.value))
        .attr('height', d => height - y(d.value));
    },
    [data]
  );

  return (
    <div className="chart-container box-office-chart">
      <h3 className="chart-title">Box Office Revenue Distribution</h3>
      <svg ref={ref} className="chart-svg" viewBox="0 0 500 400" />
    </div>
  );
};

export default BoxOfficeChart;
