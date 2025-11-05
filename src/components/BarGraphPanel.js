import { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { getD3Data, subscribe, unsubscribe } from "../console-monkey-patch";
import { getColorScale } from "../lib/utils";

export default function BarGraphPanel({ isPlaying }) {
  const svgRef = useRef(null);

  // reference for the requestAnimationFrame loop
  const animationRef = useRef(null);

  // reference for the current data piped
  const dataRef = useRef([]);
  const dimensionsRef = useRef({ width: 800, height: 320 });
  const yScaleRef = useRef(null);
  const colorScaleRef = useRef(null);

  const [colorScheme, setColorScheme] = useState("rainbow");
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // update the color scale ref whenever the state changes
  useEffect(() => {
    colorScaleRef.current = getColorScale(colorScheme);
  }, [colorScheme]);

  // data parsing function
  const parseConsoleData = useCallback((dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];

    // Get the last 50 items
    const limitedData = dataArray.slice(-50);

    return limitedData.map((item, index) => {
      const gainMatch = item.match(/gain:([\d.]+)/);
      const postgainMatch = item.match(/postgain:([\d.]+)/);
      const hcutoffMatch = item.match(/hcutoff:([\d.]+)/);
      const speedMatch = item.match(/speed:([\d.]+)/);
      const durationMatch = item.match(/duration:([\d.]+)/);

      // use the matched value, or default to 0 if not found
      const gain = parseFloat(gainMatch ? gainMatch[1] : 0) || 0;
      const postgain = parseFloat(postgainMatch ? postgainMatch[1] : 0) || 0;
      const hcutoff = parseFloat(hcutoffMatch ? hcutoffMatch[1] : 0) || 0;
      const speed = parseFloat(speedMatch ? speedMatch[1] : 0) || 0;
      const duration = parseFloat(durationMatch ? durationMatch[1] : 0) || 0;

      if (
        gain === 0 &&
        postgain === 0 &&
        hcutoff === 0 &&
        speed === 0 &&
        duration === 0
      ) {
        return { key: index, compositeValue: 0 };
      }

      const compositeValue = Math.round(
        Math.min(
          255,
          Math.max(
            0,
            (gain * 200 +
              postgain * 150 +
              hcutoff / 10 +
              speed * 100 +
              duration * 1000) /
              5,
          ),
        ),
      );

      return { key: index, i: index, compositeValue };
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      dataRef.current = [];
      return;
    }

    // this handler only updates the data ref, it doesn't trigger renders
    const handleD3Data = (event) => {
      dataRef.current = parseConsoleData(event.detail);
    };

    // get initial data on play
    const initialData = getD3Data();
    console.log("getting data", initialData);
    if (initialData && initialData.length > 0) {
      dataRef.current = parseConsoleData(initialData);
    }

    subscribe("d3Data", handleD3Data);
    return () => {
      unsubscribe("d3Data", handleD3Data);
    };
  }, [isPlaying, parseConsoleData]);

  // resize handling and setting up scales
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = d3.select(svgElement);

    // updates dimensions and y-scale on resize
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        dimensionsRef.current = { width, height };
        svg.attr("width", width).attr("height", height);

        // Y scale is dependent on height
        yScaleRef.current = d3.scaleLinear().domain([0, 1]).range([height, 0]);
      }
    });

    observer.observe(svgElement.parentElement);

    return () => {
      observer.disconnect();
    };
  }, []); 

  useEffect(() => {
    if (!isPlaying) {
      // stop loop and clear SVG if not playing
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      d3.select(svgRef.current).selectAll("rect").remove();
      return;
    }

    const svg = d3.select(svgRef.current);

    // this is the main animation loop
    const animate = () => {
      // set current state from refs
      const data = dataRef.current;
      const { width, height } = dimensionsRef.current;
      const y = yScaleRef.current;
      const colorScale = colorScaleRef.current;

      // wait if scales or data aren't ready
      if (!y || !colorScale || !data) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const time = Date.now() * 0.001 * animationSpeed;

      // X scale is calculated here because its domain depends on the data
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.key))
        .range([0, width])
        .paddingInner(0.1)
        .paddingOuter(0.1);

      svg
        .selectAll("rect")
        .data(data, (d) => d.key)
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("x", (d) => x(d.key))
              .attr("width", x.bandwidth())
              .attr("y", (d) => y(d.compositeValue / 255))
              .attr("height", (d) => height - y(d.compositeValue / 255)),

          (update) => update,

          (exit) => exit.remove(),
        )

        .attr("width", x.bandwidth())
        .attr("x", (d) => x(d.key))
        .attr("y", (d, i) => {
          const waveOffset = Math.sin(time * 2 + i * 0.1) * 2;
          const normalizedValue = d.compositeValue / 255;
          return y(normalizedValue) + waveOffset;
        })
        .attr("height", (d, i) => {
          const waveOffset = Math.sin(time * 2 + i * 0.1) * 2;
          const normalizedValue = d.compositeValue / 255;
          return Math.max(0, height - y(normalizedValue) - waveOffset);
        })
        .attr("fill", (d, i) => {
          const colorShift = Math.sin(time * 1.5 + i * 0.05) * 0.1;
          const normalizedValue = Math.max(
            0,
            Math.min(1, d.compositeValue / 255 + colorShift),
          );
          return colorScale(normalizedValue);
        })
        .attr("opacity", (d, i) => {
          const opacityPulse = 0.7 + Math.sin(time * 3 + i * 0.1) * 0.3;
          const baseOpacity = 0.6 + (d.compositeValue / 255) * 0.4;
          return baseOpacity * opacityPulse;
        });

      // continue the loop
      animationRef.current = requestAnimationFrame(animate);
    };

    // start the animation loop
    animate();

    // cleansup - stop the loop when dependencies changed
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, animationSpeed]);

  return (
    <div className="w-full h-80 bg-black relative">
      {/* Visicality-style controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setColorScheme("rainbow")}
          className={`px-3 py-1 text-xs rounded ${
            colorScheme === "rainbow"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Rainbow
        </button>
        <button
          onClick={() => setColorScheme("viridis")}
          className={`px-3 py-1 text-xs rounded ${
            colorScheme === "viridis"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Viridis
        </button>
        <button
          onClick={() => setColorScheme("plasma")}
          className={`px-3 py-1 text-xs rounded ${
            colorScheme === "plasma"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Plasma
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setAnimationSpeed(Math.max(0.5, animationSpeed - 0.5))}
          className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300"
        >
          Decrease Animation Speed
        </button>
        <button
          onClick={() => setAnimationSpeed(Math.min(3, animationSpeed + 0.5))}
          className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300"
        >
          Increase Animation Speed
        </button>
      </div>

      <svg ref={svgRef} className="h-full block bg-black" />
    </div>
  );
}
