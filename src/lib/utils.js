import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as d3 from "d3";
import {
  interpolateRainbow,
  interpolateViridis,
  interpolatePlasma,
} from "d3-scale-chromatic";

// utility function to merge clsx and tailwind-merge (shadcn)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// utility function to get a color scale based on the scheme
export const getColorScale = (scheme) => {
  switch (scheme) {
    case "rainbow":
      return d3.scaleSequential(interpolateRainbow).domain([0, 1]);
    case "viridis":
      return d3.scaleSequential(interpolateViridis).domain([0, 1]);
    case "plasma":
      return d3.scaleSequential(interpolatePlasma).domain([0, 1]);
    default:
      return d3.scaleSequential(interpolateRainbow).domain([0, 1]);
  }
};
