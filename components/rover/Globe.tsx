/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { scaleThreshold } from "d3-scale";

// Dynamically import react-globe.gl with SSR disabled
const GlobeGl = dynamic(() => import("react-globe.gl"), { ssr: false });

interface GlobeProps {
  mapData: any; // The payload from /api/v1/rover/map
  selectedCountryCode: string | null;
  onCountryClick: (countryCode: string) => void;
  width?: number;
  height?: number;
}

export default function Globe({ mapData, selectedCountryCode, onCountryClick, width, height }: GlobeProps) {
  const globeRef = useRef<any>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<any>(null);

  useEffect(() => {
    // Load GeoJSON data
    fetch("/countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setCountriesGeoJson(data);
      })
      .catch((err) => console.error("Failed to load countries geojson", err));
  }, []);

  const colorScale = useMemo(() => {
    if (!mapData || !mapData.stats || !mapData.stats.breaks) return null;
    
    // Polarity-based coloring
    const isPositive = mapData.indicator?.polarity === "POSITIVE";
    const isNegative = mapData.indicator?.polarity === "NEGATIVE";
    
    // Using simple hex colors for monochrome/strict black and white, except the heatmap as requested
    // "POSITIVE high=dark green→dark red low (wealth, GDP pc, life expectancy, literacy)"
    // "NEGATIVE high=dark red (poverty, mortality, Gini, unemployment)"
    // "NEUTRAL ... monochrome grey→black scale"
    
    let colors;
    if (isPositive) {
      colors = ["#8b0000", "#cc0000", "#ff4444", "#aacc77", "#44aa44", "#006400"]; // Red to Green
    } else if (isNegative) {
      colors = ["#006400", "#44aa44", "#aacc77", "#ff4444", "#cc0000", "#8b0000"]; // Green to Red
    } else {
      colors = ["#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#424242", "#212121"]; // Greys
    }

    // @ts-expect-error - d3-scale generic types can be strict, simple assertion fine here
    return scaleThreshold<number, string>()
      .domain(mapData.stats.breaks)
      .range(colors as any);
  }, [mapData]);

  const getPolygonColor = (feat: any) => {
    const iso3 = feat.properties.ADM0_A3_IS || feat.properties.ADM0_A3 || feat.properties.ISO_A3;
    
    // Selected country is highlighted
    if (selectedCountryCode && selectedCountryCode === iso3) {
      return "#0000ff"; // Blue highlight for selection, or a high contrast color
    }

    if (!mapData || !mapData.data || !mapData.data[iso3]) {
      return "#f0f0f0"; // No data
    }
    
    if (colorScale) {
      const val = mapData.data[iso3].value;
      return colorScale(val) as string;
    }
    
    return "#cccccc";
  };

  if (!countriesGeoJson) {
    return <div className="flex items-center justify-center h-full w-full bg-white text-black border border-black p-4">Loading Globe...</div>;
  }

  return (
    <GlobeGl
      ref={globeRef}
      width={width}
      height={height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-water.png"
      backgroundColor="#ffffff"
      polygonsData={countriesGeoJson.features}
      polygonAltitude={(feat: any) => {
        const iso3 = feat.properties.ADM0_A3_IS || feat.properties.ADM0_A3 || feat.properties.ISO_A3;
        return selectedCountryCode === iso3 ? 0.04 : 0.01;
      }}
      polygonCapColor={getPolygonColor}
      polygonSideColor={() => "#ffffff"}
      polygonStrokeColor={() => "#000000"}
      polygonLabel={(feat: any) => {
        const iso3 = feat.properties.ADM0_A3_IS || feat.properties.ADM0_A3 || feat.properties.ISO_A3;
        const name = feat.properties.ADMIN || feat.properties.NAME;
        const data = mapData?.data?.[iso3];
        const valStr = data ? `${data.value} ${mapData.indicator?.displayUnit || mapData.indicator?.unit || ""}` : "No data";
        
        return `
          <div style="background: white; color: black; padding: 4px 8px; border: 1px solid black; font-family: Inter, sans-serif; font-size: 12px;">
            <strong>${name}</strong><br/>
            ${valStr}
          </div>
        `;
      }}
      onPolygonClick={(feat: any) => {
        const iso3 = feat.properties.ADM0_A3_IS || feat.properties.ADM0_A3 || feat.properties.ISO_A3;
        onCountryClick(iso3);
      }}
      polygonsTransitionDuration={300}
    />
  );
}
