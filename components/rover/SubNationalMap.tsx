/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useRef, useState } from "react";

interface SubNationalMapProps {
  countryCode: string;
  level: string; // "state" | "district" | "subdistrict" | "city" | "ward" | "street"
  parentPlaceId?: string | null;
  activePlace?: { id: string; slug: string; name: string; level: string; latitude?: number; longitude?: number } | null;
  onSelectPlace?: (place: { id: string; slug: string; name: string; level: string }) => void;
  colorBlindMode?: boolean;
}

export default function SubNationalMap({
  countryCode,
  level,
  parentPlaceId,
  activePlace,
  onSelectPlace,
  colorBlindMode = false,
}: SubNationalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [places, setPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(true);

  // Fetch places at this level or under active place
  useEffect(() => {
    async function fetchPlaces() {
      setLoadingPlaces(true);
      try {
        let url = `/api/v1/rover/places?`;
        if (parentPlaceId) {
          url += `parent=${encodeURIComponent(parentPlaceId)}`;
        } else {
          url += `level=${encodeURIComponent(level)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.data?.places) {
          // If no children found for this specific parent (e.g. leaf level), fallback to places at this level
          if (data.data.places.length === 0 && parentPlaceId) {
            const fallbackRes = await fetch(`/api/v1/rover/places?level=${encodeURIComponent(level)}`);
            const fallbackData = await fallbackRes.json();
            if (fallbackData.success && fallbackData.data?.places) {
              setPlaces(fallbackData.data.places);
            } else {
              setPlaces([]);
            }
          } else {
            setPlaces(data.data.places);
          }
        }
      } catch (e) {
        console.error("Failed to load subnational places for map:", e);
      } finally {
        setLoadingPlaces(false);
      }
    }
    fetchPlaces();
  }, [level, parentPlaceId]);

  // Determine appropriate Center and Zoom based on Level & Place coordinates
  const getCenterAndZoom = (): { center: [number, number]; zoom: number } => {
    if (activePlace?.longitude && activePlace?.latitude) {
      const zoomMap: Record<string, number> = {
        country: 5,
        state: 6,
        district: 8.5,
        subdistrict: 10.5,
        city: 12,
        ward: 14,
        street: 16,
      };
      return {
        center: [activePlace.longitude, activePlace.latitude],
        zoom: zoomMap[activePlace.level] || 8,
      };
    }

    if (level === "district") return { center: [75.7139, 19.7515], zoom: 6.2 };
    if (level === "subdistrict" || level === "city") return { center: [72.85, 19.07], zoom: 10.5 };
    if (level === "ward") return { center: [72.827, 18.93], zoom: 13.5 };
    if (level === "street") return { center: [72.8236, 18.9271], zoom: 15.5 };

    return { center: [78.9629, 20.5937], zoom: 5 };
  };

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;

    let isMounted = true;
    const { center, zoom } = getCenterAndZoom();

    import("maplibre-gl").then((maplibregl) => {
      if (!isMounted || !mapContainer.current) return;

      const MapClass = (maplibregl as any).Map || (maplibregl as any).default?.Map;
      const NavClass = (maplibregl as any).NavigationControl || (maplibregl as any).default?.NavigationControl;

      if (!MapClass) return;

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      // High-performance clean Carto Positron / OSM tiles for clear sub-national street & boundary viewing
      const map = new MapClass({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "carto-light": {
              type: "raster",
              tiles: [
                "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors, © CARTO",
            },
          },
          layers: [
            {
              id: "carto-light-layer",
              type: "raster",
              source: "carto-light",
              minzoom: 0,
              maxzoom: 20,
            },
          ],
        },
        center,
        zoom,
      });

      if (NavClass) {
        map.addControl(new NavClass({ showCompass: true }), "top-right");
      }

      mapInstance.current = map;
    }).catch((err) => {
      console.warn("MapLibre init error:", err);
    });

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [level]);

  // Update Center / Zoom smoothly when activePlace changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const { center, zoom } = getCenterAndZoom();
    try {
      mapInstance.current.flyTo({
        center,
        zoom,
        essential: true,
        duration: 1200,
      });
    } catch (e) {
      // Map may not be ready yet
    }
  }, [activePlace, level]);

  // Update Markers when Places change
  useEffect(() => {
    if (!mapInstance.current || !places || places.length === 0) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    import("maplibre-gl").then((maplibregl) => {
      const MarkerClass = (maplibregl as any).Marker || (maplibregl as any).default?.Marker;
      const PopupClass = (maplibregl as any).Popup || (maplibregl as any).default?.Popup;
      if (!MarkerClass) return;

      places.forEach((p) => {
        if (!p.longitude || !p.latitude) return;

        // Custom clean ETW marker element
        const el = document.createElement("div");
        el.className = "etw-map-marker";
        el.style.width = "18px";
        el.style.height = "18px";
        el.style.backgroundColor = p.slug === activePlace?.slug ? "#000000" : "#ffffff";
        el.style.border = "2px solid #000000";
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        el.onclick = () => {
          if (onSelectPlace) onSelectPlace(p);
        };

        const popup = PopupClass
          ? new PopupClass({ offset: 12 }).setHTML(`
              <div style="font-family: monospace; font-size: 11px; padding: 2px;">
                <div style="font-weight: bold; text-transform: uppercase;">${p.name}</div>
                <div style="color: #666; font-size: 10px;">Level: ${p.level}</div>
                ${p.population ? `<div style="font-size: 10px;">Pop: ${Number(p.population).toLocaleString()}</div>` : ""}
              </div>
            `)
          : undefined;

        const marker = new MarkerClass({ element: el })
          .setLngLat([p.longitude, p.latitude]);

        if (popup) marker.setPopup(popup);

        marker.addTo(mapInstance.current);
        markersRef.current.push(marker);
      });
    });
  }, [places, activePlace]);

  return (
    <div className="relative w-full h-full bg-[#f4f4f4] overflow-hidden flex flex-col">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: "100%", width: "100%" }} />

      {/* Floating Sub-Region Unit Selector */}
      <div className="absolute top-4 left-4 bg-white border border-black p-3 max-h-72 overflow-y-auto z-10 w-64 shadow-md font-mono text-xs">
        <div className="flex justify-between items-center mb-2 border-b border-black pb-1">
          <span className="font-bold uppercase tracking-wider">
            {level.toUpperCase()} Units ({places.length})
          </span>
          {loadingPlaces && <span className="text-[10px] text-gray-500 animate-pulse">Loading...</span>}
        </div>

        {places.length === 0 ? (
          <div className="text-gray-500 italic py-2">
            No further sub-regions registered at this depth.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {places.map((p) => {
              const isSelected = p.slug === activePlace?.slug;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPlace && onSelectPlace(p)}
                  className={`text-left p-2 border transition-all ${
                    isSelected
                      ? "bg-black text-white border-black font-bold shadow-sm"
                      : "bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50"
                  }`}
                >
                  <div className="font-sans font-semibold text-xs flex justify-between items-center">
                    <span>{p.name}</span>
                    <span className="text-[9px] uppercase font-mono px-1 border border-current">
                      {p.level}
                    </span>
                  </div>
                  <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                    {p.population ? `Pop: ${Number(p.population).toLocaleString()}` : "Pop: Not disclosed"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Disputed borders & illustrative disclaimer */}
      <div className="absolute bottom-2 right-2 bg-white border border-black px-2 py-1 text-[10px] font-mono z-10 shadow-sm">
        Boundaries are illustrative; disputed borders not endorsed.
      </div>
    </div>
  );
}
