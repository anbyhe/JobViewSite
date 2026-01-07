import * as d3 from "d3";
import { useEffect, useRef } from "react";

export default function ECGChart() {
  const ref = useRef();

  useEffect(() => {
    const width = 600;
    const height = 300;

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#000");

    // ------ ECG Grid Background ------
    const gridSize = 25;

    for (let x = 0; x < width; x += gridSize) {
      svg.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", "#063")
        .attr("stroke-width", x % (gridSize * 5) === 0 ? 1.5 : 0.5);
    }

    for (let y = 0; y < height; y += gridSize) {
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", "#063")
        .attr("stroke-width", y % (gridSize * 5) === 0 ? 1.5 : 0.5);
    }

    const g = svg.append("g")
      .attr("transform", "translate(0,150)");

    const line = d3.line()
      .curve(d3.curveBasis)
      .x((d, i) => i)
      .y(d => -d);

    let data = new Array(width).fill(0);

    const path = g.append("path")
      .datum(data)
      .attr("stroke", "lime")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    function generateECGPoint(t) {
      // --- 简单心电图波形模拟：P QRS T ---
      t = t % 200;

      if (t < 20) return Math.sin(t / 4) * 5;      // P 波
      if (t === 40) return -60;                    // Q
      if (t === 41) return 120;                    // R
      if (t === 42) return -40;                    // S
      if (t > 60 && t < 120) return Math.sin((t - 60) / 10) * 10; // T 波

      return 0;
    }

    let t = 0;

    function tick() {
      data.push(generateECGPoint(t++));
      data.shift();

      path.attr("d", line);

      requestAnimationFrame(tick);
    }

    tick();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
      <svg ref={ref}></svg>
    </div>
  );
}