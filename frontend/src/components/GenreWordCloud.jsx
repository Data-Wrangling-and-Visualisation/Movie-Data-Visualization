import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const GenreWordCloud = () => {
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
        const data = await response.json();
        drawWordCloud(data.genres);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const drawWordCloud = (genresData) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;

    svg.attr('width', width).attr('height', height);

    const words = Object.entries(genresData).map(([text, size]) => ({
      text,
      size: size * 5
    }));

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(5)
      .rotate(() => (Math.random() - 0.5) * 60)
      .font("Impact")
      .fontSize(d => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Impact")
        .style("fill", (d, i) => d3.schemeCategory10[i % 10])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text(d => d.text);
    }
  };

  return <svg ref={svgRef}></svg>;
};

export default GenreWordCloud;