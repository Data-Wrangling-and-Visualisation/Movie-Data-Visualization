import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SentimentRadar = ({ movieId }) => {
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}`);
      const data = await response.json();
      drawRadar(data.details.Анализ_рецензий.distribution_ratios);
    };

    fetchData();
  }, [movieId]);

  const drawRadar = (sentimentData) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`);

    const data = [
      { axis: "Сильно +", value: sentimentData.strong_positive * 100 },
      { axis: "Слабо +", value: sentimentData.weak_positive * 100 },
      { axis: "Нейтрально", value: sentimentData.neutral * 100 },
      { axis: "Слабо -", value: sentimentData.weak_negative * 100 },
      { axis: "Сильно -", value: sentimentData.strong_negative * 100 }
    ];

    const maxValue = 50;
    const levels = 5;
    const angleSlice = Math.PI * 2 / data.length;

    const rScale = d3.scaleLinear()
      .range([0, innerWidth / 2 - 20])
      .domain([0, maxValue]);

    // Рисуем круги
    for (let i = 1; i <= levels; i++) {
      const levelFactor = maxValue * i / levels;
      g.selectAll(".levels")
        .data([1])
        .enter()
        .append("circle")
        .attr("class", "grid-circle")
        .attr("r", levelFactor * rScale(maxValue) / maxValue)
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-width", "0.5px");
    }

    // Оси
    const axis = g.selectAll(".axis")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("class", "line")
      .style("stroke", "#333")
      .style("stroke-width", "1px");

    axis.append("text")
      .attr("class", "legend")
      .text(d => d.axis)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2));

    // Данные
    const radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    g.append("path")
      .datum(data)
      .attr("class", "radar-area")
      .attr("d", radarLine)
      .style("fill", "rgba(100, 149, 237, 0.5)")
      .style("stroke", "steelblue")
      .style("stroke-width", "2px");
  };

  return <svg ref={svgRef} width={500} height={500}></svg>;
};

export default SentimentRadar;