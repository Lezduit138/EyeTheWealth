/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useRef, useState } from "react";

interface SubNationalMapProps {
  countryCode: string;
  level: string; // "state" | "district" | "subdistrict" | "city" | "ward" | "street"
  parentPlaceId?: string | null;
  selectedPlaceSlug?: string | null;
  onSelectPlace?: (place: { id: string; slug: string; name: string; level: string }) => void;
  colorBlindMode?: boolean;
}

export default function SubNationalMap({
  countryCode,
  level,
  parentPlaceId,
  selectedPlaceSlug,
  onSelectPlace,
  colorBlindMode = false,
}: SubNationalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [hoveredPlace, setHoveredPlace] = useState<any>(null);

  // Fetch places at this level / parent
  useEffect(() => {
    async function fetchPlaces() {
      try {
        let url = `/api/v1/rover/places?level=${encodeURIComponent(level)}`;
        if (parentPlaceId) {
          url += `&parent=${encodeURIComponent(parentPlaceId)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.data?.places) {
          setPlaces(data.data.places);
        }
      } catch (e) {
        console.error("Failed to load subnational places for map:", e);
      }
    }
    fetchPlaces();
  }, [level, parentPlaceId]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;
    let map: any = null;

    let isMounted = true;
    import("maplibre-gl").then((maplibregl) => {
      if (!isMounted || !mapContainer.current) return;

      // Clean existing content if any
      const MapClass = (maplibregl as any).Map || (maplibregl as any).default?.Map;
      const NavClass = (maplibregl as any).NavigationControl || (maplibregl as any).default?.NavigationControl;

      if (!MapClass) return;

      map = new MapClass({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "openfreemap": {
              type: "raster",
              tiles: ["https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "Map data © OpenStreetMap contributors, OpenFreeMap",
            },
          },
          layers: [
            {
              id: "base-tiles",
              type: "raster",
              source: "openfreemap",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [75.7139, 19.7515], // Maharashtra center
        zoom: level === "district" ? 6 : level === "ward" || level === "street" ? 13 : 5,
      });

      if (NavClass) {
        map.addControl(new NavClass(), "top-right");
      }

      map.on("load", () => {
        if (!isMounted) return;
        setMapLoaded(true);
      });
    }).catch(err => {
      console.warn("MapLibre fallback:", err);
    });

    return () => {
      isMounted = false;
      if (map) map.remove();
    };
  }, [level]);

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden flex flex-col">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Region list overlay for immediate click interaction & keyboard accessibility */}
      <div className="absolute top-4 left-4 bg-white border border-black p-3 max-h-64 overflow-y-auto z-10 w-64 shadow-md font-mono text-xs">
        <div className="font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">
          {level.toUpperCase()} Units ({places.length})
        </div>
        {places.length === 0 ? (
          <div className="text-gray-500 italic">No sub-regions recorded.</div>
        ) : (
          <div className="flex flex-col gap-1">
            {places.map((p) => {
              const isSelected = p.slug === selectedPlaceSlug;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPlace && onSelectPlace(p)}
                  onMouseEnter={() => setHoveredPlace(p)}
                  className={`text-left p-1.5 border ${
                    isSelected
                      ? "bg-black text-white border-black font-bold"
                      : "bg-white text-black border-gray-300 hover:border-black"
                  }`}
                >
                  <div className="font-sans font-medium">{p.name}</div>
                  <div className="text-[10px] text-gray-500">
                    Pop: {p.population ? p.population.toLocaleString() : "Not disclosed"} · {p.boundaryVintage || "2021"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Disputed borders & illustrative disclaimer */}
      <div className="absolute bottom-2 right-2 bg-white border border-black px-2 py-1 text-[10px] font-mono z-10">
        Boundaries are illustrative; disputed borders not endorsed.
      </div>
    </div>
  );
}
