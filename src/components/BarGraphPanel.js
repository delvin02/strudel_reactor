import { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { select, scaleSequential, scaleLinear, scaleBand } from "d3";
import {
  interpolateRainbow,
  interpolateViridis,
  interpolatePlasma,
} from "d3-scale-chromatic";
import { getD3Data, subscribe, unsubscribe } from "../console-monkey-patch";

export default function BarGraphPanel({ isPlaying }) {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const [colorScheme, setColorScheme] = useState("rainbow");
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const clearBars = (svg) => {
    if (svg) {
      svg.selectAll("rect").remove();
    }
  };

  const getColorScale = (scheme) => {
    switch (scheme) {
      case "rainbow":
        return scaleSequential(interpolateRainbow).domain([0, 1]);
      case "viridis":
        return scaleSequential(interpolateViridis).domain([0, 1]);
      case "plasma":
        return scaleSequential(interpolatePlasma).domain([0, 1]);
      default:
        return scaleSequential(interpolateRainbow).domain([0, 1]);
    }
  };

  const renderBars = (svg, data, containerWidth, containerHeight) => {
    if (
      !data ||
      data.length === 0 ||
      !svg ||
      !containerWidth ||
      !containerHeight
    ) {
      return;
    }

    // Clear previous content
    clearBars(svg);

    // Set up scales
    const colorScale = getColorScale(colorScheme);
    const y = scaleLinear().domain([0, 1]).range([containerHeight, 0]);
    const x = scaleBand()
      .domain(data.map((d, i) => i))
      .range([0, containerWidth])
      .paddingInner(0.1)
      .paddingOuter(0.1);

    // Create bars
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => x(i))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.compositeValue / 255))
      .attr("height", (d) => containerHeight - y(d.compositeValue / 255))
      .attr("fill", (d) => {
        const normalizedValue = d.compositeValue / 255;
        return colorScale(normalizedValue);
      })
      .attr("opacity", (d) => 0.6 + (d.compositeValue / 255) * 0.4);
  };

  const startAnimation = (svg, data, containerWidth, containerHeight) => {
    if (!data || data.length === 0 || !svg || !isPlaying) return;

    const colorScale = getColorScale(colorScheme);
    const y = scaleLinear().domain([0, 1]).range([containerHeight, 0]);

    const animate = () => {
      if (!isPlaying) {
        // Stop animation if not playing
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      const time = Date.now() * 0.001 * animationSpeed;

      // Update bars with smooth transitions
      svg
        .selectAll("rect")
        .data(data)
        .transition()
        .duration(50)
        .ease(d3.easeQuadOut)
        .attr("y", (d, i) => {
          const waveOffset = Math.sin(time * 2 + i * 0.1) * 2;
          const normalizedValue = d.compositeValue / 255;
          return y(normalizedValue) + waveOffset;
        })
        .attr("height", (d, i) => {
          const waveOffset = Math.sin(time * 2 + i * 0.1) * 2;
          const normalizedValue = d.compositeValue / 255;
          return Math.max(0, containerHeight - y(normalizedValue) - waveOffset);
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

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const parseConsoleData = useCallback((dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];

    const limitedData = dataArray.slice(-50);

    return limitedData.map((item, index) => {
      const matches = item.match(
        /gain:([\d.]+).*postgain:([\d.]+).*hcutoff:([\d.]+).*speed:([\d.]+).*duration:([\d.]+)/,
      );

      if (!matches) {
        return { index, compositeValue: 0 };
      }

      const gain = parseFloat(matches[1]) || 0;
      const postgain = parseFloat(matches[2]) || 0;
      const hcutoff = parseFloat(matches[3]) || 0;
      const speed = parseFloat(matches[4]) || 0;
      const duration = parseFloat(matches[5]) || 0;

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

      return { index, compositeValue };
    });
  }, []);

  // Handle isPlaying changes
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = select(svgElement);

    if (!isPlaying) {
      // Clear everything when not playing
      clearBars(svg);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isPlaying]);

  // Real-time data subscription
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const containerWidth = window.innerWidth || svgElement.clientWidth || 800;
    const containerHeight = svgElement.clientHeight || 320;
    const svg = select(svgElement);
    svg.attr("width", containerWidth).attr("height", containerHeight);

    const handleD3Data = (event) => {
      if (!isPlaying) return;

      const parsedData = parseConsoleData(event.detail);
      if (parsedData && parsedData.length > 0) {
        // Stop any existing animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }

        // Render bars and start animation
        renderBars(svg, parsedData, containerWidth, containerHeight);
        startAnimation(svg, parsedData, containerWidth, containerHeight);
      }
    };

    // Only subscribe when playing
    if (isPlaying) {
      subscribe("d3Data", handleD3Data);

      // Get initial data if available
      const initialData = getD3Data();
      if (initialData && initialData.length > 0) {
        const parsedData = parseConsoleData(initialData);
        renderBars(svg, parsedData, containerWidth, containerHeight);
        startAnimation(svg, parsedData, containerWidth, containerHeight);
      }
    }

    return () => {
      // always unsubscribe to prevent multiple listeners
      unsubscribe("d3Data", handleD3Data);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, parseConsoleData]);

  // Window resize handler
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const svgElement = svgRef.current;
        if (svgElement && isPlaying) {
          const containerWidth =
            window.innerWidth || svgElement.clientWidth || 800;
          const containerHeight = svgElement.clientHeight || 320;
          const svg = select(svgElement);
          svg.attr("width", containerWidth).attr("height", containerHeight);

          // Re-render with current data
          const currentData = getD3Data();
          if (currentData && currentData.length > 0) {
            const parsedData = parseConsoleData(currentData);
            renderBars(svg, parsedData, containerWidth, containerHeight);
            startAnimation(svg, parsedData, containerWidth, containerHeight);
          }
        }
      }, 100);
    };

    // Only add resize listener when playing
    if (isPlaying) {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [isPlaying, parseConsoleData]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up all event listeners and animations on unmount
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Clear any remaining bars
      const svgElement = svgRef.current;
      if (svgElement) {
        const svg = select(svgElement);
        clearBars(svg);
      }
    };
  }, []);

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
          Slower
        </button>
        <button
          onClick={() => setAnimationSpeed(Math.min(3, animationSpeed + 0.5))}
          className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300"
        >
          Faster
        </button>
      </div>

      <svg ref={svgRef} className="h-full block bg-black" />
    </div>
  );
}
