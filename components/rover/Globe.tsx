/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { scaleThreshold } from "d3-scale";
import { Globe as GlobeIcon, Map as MapIcon, Loader2 } from "lucide-react";

// Client-mount subscriber for SSR safety in React 19
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Dynamically import react-globe.gl with SSR disabled
const GlobeGl = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#f8f8f8] text-black font-mono text-xs">
      <Loader2 className="animate-spin mb-2" size={20} />
      <span>INITIALIZING 3D WEBGL GLOBE...</span>
    </div>
  ),
});

interface GlobeProps {
  mapData: any; // The payload from /api/v1/rover/map
  selectedCountryCode: string | null;
  onCountryClick: (countryCode: string) => void;
  width?: number;
  height?: number;
}

export default function Globe({
  mapData,
  selectedCountryCode,
  onCountryClick,
  width: customWidth,
  height: customHeight,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const isMounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Measure container size dynamically
  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    measure();
    const observer = new ResizeObserver(() => measure());
    observer.observe(containerRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isMounted]);

  // Load GeoJSON data
  useEffect(() => {
    fetch("/countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setCountriesGeoJson(data);
      })
      .catch((err) => console.error("Failed to load countries geojson", err));
  }, []);

  // Set initial point of view and rotation when globe mounts
  useEffect(() => {
    if (globeRef.current) {
      try {
        globeRef.current.pointOfView({ lat: 20, lng: 15, altitude: 2.2 });
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.4;
        }
      } catch (err) {
        console.warn("Globe controls initialization:", err);
      }
    }
  }, [countriesGeoJson, dimensions]);

  // Zoom to selected country
  useEffect(() => {
    if (!globeRef.current || !selectedCountryCode || !countriesGeoJson) return;

    const feat = countriesGeoJson.features?.find((f: any) => {
      const iso3 =
        f.properties.ADM0_A3_IS || f.properties.ADM0_A3 || f.properties.ISO_A3;
      return iso3 === selectedCountryCode;
    });

    if (feat && feat.bbox) {
      const [minLng, minLat, maxLng, maxLat] = feat.bbox;
      const lat = (minLat + maxLat) / 2;
      const lng = (minLng + maxLng) / 2;
      try {
        globeRef.current.pointOfView({ lat, lng, altitude: 1.6 }, 1000);
      } catch {
        // ignore
      }
    }
  }, [selectedCountryCode, countriesGeoJson]);

  // Color scale calculation
  const colorScale = useMemo(() => {
    if (!mapData || !mapData.stats || !mapData.stats.breaks) return null;

    const isPositive = mapData.indicator?.polarity === "POSITIVE";
    const isNegative = mapData.indicator?.polarity === "NEGATIVE";

    let colors: string[];
    if (isPositive) {
      colors = ["#8b0000", "#cc0000", "#ff4444", "#aacc77", "#44aa44", "#006400"];
    } else if (isNegative) {
      colors = ["#006400", "#44aa44", "#aacc77", "#ff4444", "#cc0000", "#8b0000"];
    } else {
      colors = ["#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#424242", "#212121"];
    }

    return scaleThreshold<number, string>()
      .domain(mapData.stats.breaks)
      .range(colors as any);
  }, [mapData]);

  const getPolygonColor = (feat: any) => {
    const iso3 =
      feat.properties.ADM0_A3_IS || feat.properties.ADM0_A3 || feat.properties.ISO_A3;

    if (selectedCountryCode && selectedCountryCode === iso3) {
      return "#0000ff"; // Blue highlight for active selection
    }

    if (!mapData || !mapData.data || !mapData.data[iso3]) {
      return "#e2e2e2"; // Distinct no-data grey
    }

    if (colorScale) {
      const val = mapData.data[iso3].value;
      return colorScale(val) as string;
    }

    return "#cccccc";
  };

  const finalWidth = customWidth || dimensions.width || 800;
  const finalHeight = customHeight || dimensions.height || 600;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] flex-1 flex flex-col bg-[#fafafa] overflow-hidden select-none"
    >
      {/* View Switcher: 3D Globe vs 2D Map */}
      <div className="absolute top-4 right-4 z-20 flex border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
        <button
          onClick={() => setViewMode("3D")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            viewMode === "3D"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
          title="Switch to 3D Globe View"
        >
          <GlobeIcon size={13} />
          <span>3D Globe</span>
        </button>
        <button
          onClick={() => setViewMode("2D")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-l-2 border-black ${
            viewMode === "2D"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
          title="Switch to 2D Projection Map"
        >
          <MapIcon size={13} />
          <span>2D Map</span>
        </button>
      </div>

      {!countriesGeoJson || !isMounted ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full bg-white text-black font-mono text-xs">
          <Loader2 className="animate-spin mb-2" size={24} />
          <span>LOADING GEOGRAPHIC DATA...</span>
        </div>
      ) : viewMode === "3D" ? (
        /* 3D GLOBE RENDERER */
        <div className="relative w-full h-full flex-1 flex items-center justify-center">
          <GlobeGl
            ref={globeRef}
            width={finalWidth}
            height={finalHeight}
            globeImageUrl="/earth-water.png"
            backgroundColor="#ffffff"
            polygonsData={countriesGeoJson.features}
            polygonAltitude={(feat: any) => {
              const iso3 =
                feat.properties.ADM0_A3_IS ||
                feat.properties.ADM0_A3 ||
                feat.properties.ISO_A3;
              return selectedCountryCode === iso3 ? 0.05 : 0.01;
            }}
            polygonCapColor={getPolygonColor}
            polygonSideColor={() => "rgba(0,0,0,0.15)"}
            polygonStrokeColor={() => "#111111"}
            polygonLabel={(feat: any) => {
              const iso3 =
                feat.properties.ADM0_A3_IS ||
                feat.properties.ADM0_A3 ||
                feat.properties.ISO_A3;
              const name = feat.properties.ADMIN || feat.properties.NAME;
              const data = mapData?.data?.[iso3];
              const valStr = data
                ? `${data.value.toLocaleString()} ${
                    mapData.indicator?.displayUnit || mapData.indicator?.unit || ""
                  }`
                : "No data available";

              return `
                <div style="background: black; color: white; padding: 6px 10px; border: 1px solid white; font-family: monospace; font-size: 11px; text-transform: uppercase;">
                  <strong style="font-size: 12px; letter-spacing: 0.05em;">${name} (${iso3})</strong><br/>
                  <span style="color: #aaa;">Value:</span> <span style="font-weight: bold; color: #fff;">${valStr}</span>
                </div>
              `;
            }}
            onPolygonClick={(feat: any) => {
              const iso3 =
                feat.properties.ADM0_A3_IS ||
                feat.properties.ADM0_A3 ||
                feat.properties.ISO_A3;
              onCountryClick(iso3);
            }}
            polygonsTransitionDuration={200}
          />
        </div>
      ) : (
        /* 2D PROJECTION MAP FALLBACK */
        <div className="relative w-full h-full flex-1 flex items-center justify-center p-4 bg-white overflow-auto">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-auto max-h-[80vh] border-2 border-black bg-[#f0f4f8]"
          >
            {countriesGeoJson.features?.map((feat: any, idx: number) => {
              const iso3 =
                feat.properties.ADM0_A3_IS ||
                feat.properties.ADM0_A3 ||
                feat.properties.ISO_A3;
              const name = feat.properties.ADMIN || feat.properties.NAME;
              const color = getPolygonColor(feat);
              const isSelected = selectedCountryCode === iso3;

              // Simple equirectangular projection path calculation
              const geom = feat.geometry;
              if (!geom) return null;

              const projectCoords = (coords: number[][]) => {
                return coords
                  .map(([lng, lat]) => {
                    const x = ((lng + 180) / 360) * 1000;
                    const y = ((90 - lat) / 180) * 500;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ");
              };

              let dPath = "";
              if (geom.type === "Polygon") {
                dPath = geom.coordinates
                  .map((ring: number[][]) => `M ${projectCoords(ring)} Z`)
                  .join(" ");
              } else if (geom.type === "MultiPolygon") {
                dPath = geom.coordinates
                  .map((poly: number[][][]) =>
                    poly.map((ring: number[][]) => `M ${projectCoords(ring)} Z`).join(" ")
                  )
                  .join(" ");
              }

              return (
                <path
                  key={iso3 || idx}
                  d={dPath}
                  fill={color}
                  stroke={isSelected ? "#000" : "#555"}
                  strokeWidth={isSelected ? "1.5" : "0.5"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onCountryClick(iso3)}
                >
                  <title>
                    {name} ({iso3}):{" "}
                    {mapData?.data?.[iso3]
                      ? `${mapData.data[iso3].value} ${mapData.indicator?.unit || ""}`
                      : "No data"}
                  </title>
                </path>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
