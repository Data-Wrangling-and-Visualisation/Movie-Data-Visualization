import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const useD3 = (renderChartFn, dependencies) => {
  const svgRef = useRef();

  useEffect(() => {
    if (svgRef.current && dependencies[0] && Object.keys(dependencies[0]).length > 0) {

      d3.select(svgRef.current).selectAll("*").remove();
      const svg = d3.select(svgRef.current);
      renderChartFn(svg);
      
    }
  }, dependencies);

  return svgRef;
};