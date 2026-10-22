/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";

interface Place {
  id: string;
  slug: string;
  name: string;
  level: string;
  latitude?: number | null;
  longitude?: number | null;
  population?: number | null;
}

interface SubNationalMapProps {
  countryCode: string;
  level: string;
  parentPlaceId?: string | null;
  activePlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  colorBlindMode?: boolean;
}

// Level → default center/zoom for India
const LEVEL_DEFAULTS: Record<string, { center: [number, number]; zoom: number }> = {
  country:     { center: [20.5937, 78.9629], zoom: 5 },
  state:       { center: [20.5937, 78.9629], zoom: 5 },
  district:    { center: [19.7515, 75.7139], zoom: 6 },
  subdistrict: { center: [19.07,   72.85],   zoom: 10 },
  city:        { center: [19.07,   72.85],   zoom: 11 },
  ward:        { center: [18.93,   72.827],  zoom: 14 },
  street:      { center: [18.927,  72.824],  zoom: 16 },
};

const LEVEL_ZOOM: Record<string, number> = {
  country: 5, state: 6, district: 8, subdistrict: 10, city: 12, ward: 14, street: 16,
};

export default function SubNationalMap({
  level,
  parentPlaceId,
  activePlace,
  onSelectPlace,
}: SubNationalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const leafletMap   = useRef<any>(null);
  const markersRef   = useRef<any>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch child places ─────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) setLoading(true);
      try {
        const url = parentPlaceId
          ? `/api/v1/rover/places?parent=${encodeURIComponent(parentPlaceId)}`
          : `/api/v1/rover/places?level=${encodeURIComponent(level)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!cancelled && json.success) {
          const items: Place[] = json.data?.places ?? [];
          // Fallback: if parent returned nothing, fetch by level
          if (items.length === 0 && parentPlaceId) {
            const fb = await fetch(`/api/v1/rover/places?level=${encodeURIComponent(level)}`);
            const fbj = await fb.json();
            if (!cancelled && fbj.success) setPlaces(fbj.data?.places ?? []);
          } else {
            if (!cancelled) setPlaces(items);
          }
        }
      } catch (e) {
        if (!cancelled) console.error("[SubNationalMap] fetch error", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [level, parentPlaceId]);

  /* ── Compute center & zoom ──────────────────────────────────────────── */
  const getView = (): { center: [number, number]; zoom: number } => {
    if (activePlace?.latitude && activePlace?.longitude) {
      return {
        center: [activePlace.latitude, activePlace.longitude],
        zoom:   LEVEL_ZOOM[activePlace.level] ?? 8,
      };
    }
    return LEVEL_DEFAULTS[level] ?? LEVEL_DEFAULTS.state;
  };

  /* ── Initialise Leaflet map once ────────────────────────────────────── */
  useEffect(() => {
    if (!mapContainer.current) return;
    let unmounted = false;

    import("leaflet").then((Lm) => {
      const L = Lm.default ?? Lm;
      if (unmounted || !mapContainer.current) return;

      // Fix Leaflet default-icon broken in webpack/Next.js builds
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Destroy any stale instance (HMR safety)
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const { center, zoom } = getView();

      const map = L.map(mapContainer.current!, {
        center,
        zoom,
        zoomControl:       true,
        attributionControl: true,
        preferCanvas:      true,
      });

      // OpenStreetMap standard tiles — 100% free, zero API key required
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current  = L.layerGroup().addTo(map);
      leafletMap.current  = map;

      // Force repaint after layout
      setTimeout(() => { if (!unmounted) map.invalidateSize(); }, 300);
    });

    return () => {
      unmounted = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markersRef.current = null;
      }
    };
    // Intentionally only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fly to when activePlace or level changes ───────────────────────── */
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    const { center, zoom } = getView();
    try { map.flyTo(center, zoom, { duration: 1.0 }); } catch { /* unmounted */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlace, level]);

  /* ── Re-draw markers when places change ─────────────────────────────── */
  useEffect(() => {
    if (!leafletMap.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    import("leaflet").then((Lm) => {
      const L = Lm.default ?? Lm;
      if (!markersRef.current) return;

      places.forEach((p) => {
        if (p.latitude == null || p.longitude == null) return;

        const isActive = p.slug === activePlace?.slug;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${isActive ? 20 : 14}px;
            height:${isActive ? 20 : 14}px;
            background:${isActive ? "#000" : "#fff"};
            border:2px solid #000;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
            cursor:pointer;
            border-radius:2px;
          "></div>`,
          iconSize:   [isActive ? 20 : 14, isActive ? 20 : 14],
          iconAnchor: [isActive ? 10 : 7,  isActive ? 10 : 7],
        });

        const marker = L.marker([p.latitude!, p.longitude!], { icon });

        marker.bindPopup(
          `<div style="font-family:monospace;font-size:11px;padding:4px 8px;color:#000;min-width:120px;">
            <div style="font-weight:700;text-transform:uppercase;margin-bottom:2px;">${p.name}</div>
            <div style="color:#555;font-size:10px;">Level: ${p.level}</div>
            ${p.population ? `<div style="font-size:10px;">Pop: ${Number(p.population).toLocaleString()}</div>` : ""}
          </div>`
        );

        marker.on("click", () => {
          if (onSelectPlace) onSelectPlace(p);
        });

        markersRef.current.addLayer(marker);
      });
    });
  }, [places, activePlace, onSelectPlace]);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f4f4f4", overflow: "hidden" }}>

      {/* ── The actual Leaflet map canvas ─────────────────────── */}
      <div
        ref={mapContainer}
        style={{ width: "100%", flex: 1, minHeight: 0, zIndex: 0 }}
      />

      {/* ── Floating region list ──────────────────────────────── */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1000,
        background: "#fff", border: "1px solid #000",
        width: 240, maxHeight: 280, overflowY: "auto",
        padding: "8px", fontFamily: "monospace", fontSize: 11,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #000", paddingBottom: 4, marginBottom: 6 }}>
          <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            {level.toUpperCase()} ({places.length})
          </span>
          {loading && <span style={{ fontSize: 9, color: "#888" }}>Loading…</span>}
        </div>

        {places.length === 0 && !loading ? (
          <div style={{ color: "#777", fontStyle: "italic", padding: "4px 0" }}>
            No sub-regions at this depth.
          </div>
        ) : (
          places.map((p) => {
            const sel = p.slug === activePlace?.slug;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlace && onSelectPlace(p)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "5px 6px", marginBottom: 3, cursor: "pointer",
                  background: sel ? "#000" : "#fff",
                  color:      sel ? "#fff" : "#000",
                  border:     sel ? "1px solid #000" : "1px solid #ccc",
                  fontFamily: "inherit", fontSize: 11,
                  fontWeight: sel ? 700 : 400,
                  transition: "background 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 12 }}>{p.name}</span>
                  <span style={{ fontSize: 9, border: "1px solid currentColor", padding: "0 3px", textTransform: "uppercase" }}>{p.level}</span>
                </div>
                <div style={{ fontSize: 10, color: sel ? "#ccc" : "#666", marginTop: 2 }}>
                  {p.population ? `Pop: ${Number(p.population).toLocaleString()}` : "Pop: Not disclosed"}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* ── Disclaimer strip ─────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 8, right: 8, zIndex: 1000,
        background: "#fff", border: "1px solid #000",
        padding: "3px 7px", fontSize: 9, fontFamily: "monospace",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }}>
        Boundaries illustrative — disputed borders not endorsed
      </div>
    </div>
  );
}
