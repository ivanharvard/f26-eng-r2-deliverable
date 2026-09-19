/* eslint-disable */
"use client";
import { useRef, useEffect, useState  } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

// TODO: Write this interface
interface AnimalDatum  {
  name: string;
  speed: number;
  diet: "herbivore" | "carnivore" | "omnivore";
}

const DIET_TYPES: AnimalDatum["diet"][] = ["herbivore", "carnivore", "omnivore"];

const DIET_COLORS: Record<AnimalDatum["diet"], string> = {
  herbivore: "#4CAF50", // Green
  carnivore: "#F44336", // Red
  omnivore: "#FF9800", // Orange
};

const TOP_N = 20;

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // TODO: Load CSV data
  useEffect(() => {
    csv<AnimalDatum>("/sample_animals.csv", (row) => {
      return {
        name: row.Name!,
        speed: +row.Speed!,
        diet: row.Diet! as AnimalDatum["diet"],
      };
    }).then((rows) => {
      const fastest = rows.sort((a, b) => b.speed - a.speed).slice(0, TOP_N);
      setAnimalData(fastest);
    })
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 110, left: 100 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg  = select(graphRef.current!)
      .append<SVGSVGElement>("svg")
      .attr("width", width)
      .attr("height", height)

    const xScale = scaleBand<string>()
      .domain(animalData.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const yScale = scaleLinear()
      .domain([0, (max(animalData, (d) => d.speed) ?? 0) * 1.1])
      .range([height - margin.bottom, margin.top]);

    const colorScale = scaleOrdinal<AnimalDatum["diet"], string>()
      .domain(DIET_TYPES)
      .range(DIET_TYPES.map((diet) => DIET_COLORS[diet]));

    // Draw bars
    svg
      .selectAll("rect")
      .data(animalData)
      .join("rect")
      .attr("x", (d) => xScale(d.name)!)
      .attr("y", (d) => yScale(d.speed))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => yScale(0) - yScale(d.speed))
      .attr("rx", 3)
      .attr("fill", (d) => colorScale(d.diet));

    // Draw axes
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(xScale));

    xAxis
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.4em")
      .style("fill", "hsl(var(--foreground))");

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(axisLeft(yScale));

    yAxis.selectAll("text").style("fill", "hsl(var(--foreground))");

    // Add axis labels
    svg
      .append("text")
      .attr("x", (margin.left + (width - margin.right)) / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .text("Animal");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + (height - margin.bottom)) / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .text("Speed (km/h)");
    
    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right - 110}, ${margin.top - 45})`);

    DIET_TYPES.forEach((diet, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);

      row.append("rect").attr("width", 12).attr("height", 12).attr("rx", 2).attr("fill", DIET_COLORS[diet]);
      row
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .style("text-transform", "capitalize")
        .style("fill", "hsl(var(--foreground))")
        .text(diet);
    });

  }, [animalData]);

  return <div ref={graphRef} className="relative w-full" style={{ minHeight: 400 }} />;
}
