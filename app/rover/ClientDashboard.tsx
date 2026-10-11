/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Globe from "@/components/rover/Globe";
import SubNationalMap from "@/components/rover/SubNationalMap";
import AreaPanel from "@/components/rover/AreaPanel";
import { Search, ChevronRight, Home, ArrowLeft } from "lucide-react";

export default function ClientDashboard({ categories }: { categories: any[] }) {
  const [selectedIndicator, setSelectedIndicator] = useState("gdp-per-capita");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Sub-national drilldown state
  // Levels: "country" | "state" | "district" | "subdistrict" | "city" | "ward" | "street"
  const [currentLevel, setCurrentLevel] = useState<string>("country");
  const [activePlace, setActivePlace] = useState<{ id: string; slug: string; name: string; level: string } | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; slug: string; name: string; level: string }>>([]);
  const [colorBlindMode, setColorBlindMode] = useState<boolean>(false);

  const [mapData, setMapData] = useState<any>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  
  const [expandedCategory, setExpandedCategory] = useState<string>("Economy");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

  // Fetch Map Data when indicator, year, level, or activePlace changes
  useEffect(() => {
    async function fetchMap() {
      setLoadingMap(true);
      try {
        let url = `/api/v1/rover/map?indicator=${encodeURIComponent(selectedIndicator)}&level=${encodeURIComponent(currentLevel)}`;
        if (selectedYear) url += `&year=${selectedYear}`;
        if (activePlace) url += `&parent=${encodeURIComponent(activePlace.id)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setMapData(data.data);
          if (!selectedYear && data.data.year) {
            setSelectedYear(data.data.year);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMap(false);
      }
    }
    fetchMap();
  }, [selectedIndicator, selectedYear, currentLevel, activePlace]);

  // Handle Search Input
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/rover/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success) setSearchResults(data.data);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Country Selection from 3D Globe
  const handleCountryClick = (code: string) => {
    setSelectedCountry(code);
    if (code === "IND") {
      // Transition to Sub-National India level
      setCurrentLevel("state");
      setActivePlace({ id: "cmv46wpmt0007ijk781e7v3h3", slug: "india", name: "India", level: "country" });
      setBreadcrumbs([{ id: "cmv46wpmt0007ijk781e7v3h3", slug: "india", name: "India", level: "country" }]);
    }
  };

  // Sub-National Place Drilldown
  const handlePlaceSelect = (place: { id: string; slug: string; name: string; level: string }) => {
    setActivePlace(place);
    setBreadcrumbs((prev) => {
      const idx = prev.findIndex((p) => p.id === place.id);
      if (idx !== -1) return prev.slice(0, idx + 1);
      return [...prev, place];
    });

    // Advance level
    if (place.level === "state") setCurrentLevel("district");
    else if (place.level === "district") setCurrentLevel("subdistrict");
    else if (place.level === "subdistrict") setCurrentLevel("city");
    else if (place.level === "city") setCurrentLevel("ward");
    else if (place.level === "ward") setCurrentLevel("street");
  };

  // Breadcrumb navigation click
  const handleBreadcrumbClick = (idx: number) => {
    if (idx === -1) {
      // Reset to Global Globe
      setCurrentLevel("country");
      setActivePlace(null);
      setSelectedCountry(null);
      setBreadcrumbs([]);
      return;
    }
    const target = breadcrumbs[idx];
    setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
    setActivePlace(target);
    if (target.level === "country") setCurrentLevel("state");
    else if (target.level === "state") setCurrentLevel("district");
    else if (target.level === "district") setCurrentLevel("subdistrict");
    else if (target.level === "subdistrict") setCurrentLevel("city");
    else if (target.level === "city") setCurrentLevel("ward");
    else if (target.level === "ward") setCurrentLevel("street");
  };

  // Legend Component
  const renderLegend = () => {
    if (!mapData || !mapData.stats || !mapData.stats.breaks) return null;
    const { breaks } = mapData.stats;
    const isPositive = mapData.indicator?.polarity === "POSITIVE";
    const isNegative = mapData.indicator?.polarity === "NEGATIVE";
    
    let colors = ["#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#424242", "#212121"];
    if (colorBlindMode) {
      // Accessible Viridis / Blue-Orange scale
      colors = ["#440154", "#414487", "#2a788e", "#22a884", "#7ad151", "#fde725"];
    } else {
      if (isPositive) colors = ["#8b0000", "#cc0000", "#ff4444", "#aacc77", "#44aa44", "#006400"];
      if (isNegative) colors = ["#006400", "#44aa44", "#aacc77", "#ff4444", "#cc0000", "#8b0000"];
    }

    return (
      <div className="absolute bottom-6 left-6 bg-white border border-black p-4 text-xs font-mono z-10 w-72 shadow-md">
        <div className="flex justify-between items-start mb-1">
          <div className="font-bold uppercase text-black">{mapData.indicator?.name}</div>
          <button 
            onClick={() => setColorBlindMode(!colorBlindMode)}
            className="text-[10px] px-1 border border-black bg-gray-100 hover:bg-gray-200"
          >
            {colorBlindMode ? "Standard" : "Color-Blind"}
          </button>
        </div>
        
        <div className="text-gray-600 mb-1">{mapData.year} · {mapData.indicator?.unit}</div>
        <div className="text-[10px] font-bold text-gray-800 mb-3 uppercase">
          Resolution: {currentLevel} · Vintage: 2011/2021
        </div>
        
        <div className="flex flex-col gap-1">
          {colors.map((c, i) => {
            const min = i === 0 ? "Min" : Math.round(breaks[i-1]);
            const max = i === breaks.length ? "Max" : Math.round(breaks[i]);
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 border border-black" style={{ backgroundColor: c }}></div>
                <span>{min} - {max}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 border border-black bg-[repeating-linear-gradient(45deg,#ccc,#ccc_2px,#fff_2px,#fff_4px)]"></div>
            <span>No data / Not disclosed</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-300 text-[10px] italic text-gray-500">
          Quantiles calculated within parent region. Never apportioned.
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-white text-black font-sans">
      
      {/* TOP NAVIGATION BREADCRUMB BAR */}
      <div className="h-10 border-b border-black bg-white flex items-center px-4 font-mono text-xs z-30 justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="flex items-center gap-1 text-black hover:underline font-bold"
          >
            <Home size={14} /> Global Globe
          </button>

          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={b.id}>
              <ChevronRight size={12} className="text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`hover:underline capitalize ${
                  idx === breadcrumbs.length - 1 ? "font-bold underline text-black" : "text-gray-600"
                }`}
              >
                {b.name} ({b.level})
              </button>
            </React.Fragment>
          ))}
        </div>

        {breadcrumbs.length > 0 && (
          <button
            onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)}
            className="flex items-center gap-1 border border-black px-2 py-0.5 text-[11px] hover:bg-gray-100"
          >
            <ArrowLeft size={12} /> Back
          </button>
        )}
      </div>

      <div className="flex flex-grow w-full overflow-hidden relative">
        {/* LEFT PANEL: Indicators & Categories */}
        <div className="w-80 flex-shrink-0 border-r border-black flex flex-col bg-white overflow-hidden z-20">
          <div className="p-4 border-b border-black relative">
            <div className="flex items-center border border-black p-2 mb-1">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search places, indicators, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
              />
            </div>

            {/* Search Dropdown Results */}
            {searchResults && (
              <div className="absolute top-16 left-4 right-4 bg-white border border-black shadow-lg max-h-80 overflow-y-auto z-40 p-2 font-mono text-xs">
                {searchResults.places?.length > 0 && (
                  <div className="mb-2">
                    <div className="font-bold uppercase text-[10px] text-gray-500 mb-1">Places (Drilldown)</div>
                    {searchResults.places.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          handlePlaceSelect(p);
                          setSearchQuery("");
                          setSearchResults(null);
                        }}
                        className="w-full text-left p-1 border-b border-gray-100 hover:bg-gray-100 flex justify-between"
                      >
                        <span className="font-sans font-medium">{p.name}</span>
                        <span className="text-[10px] uppercase text-gray-500">{p.level}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.geocodedStreets?.length > 0 && (
                  <div className="mb-2">
                    <div className="font-bold uppercase text-[10px] text-gray-500 mb-1">Streets & Localities (Photon)</div>
                    {searchResults.geocodedStreets.map((s: any, idx: number) => (
                      <div key={idx} className="p-1 border-b border-gray-100 text-gray-700">
                        {s.name} <span className="text-[10px] text-gray-400">({s.city})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
            {categories.map(cat => (
              <div key={cat.id} className="mb-2">
                <button 
                  className={`w-full text-left p-3 font-bold uppercase tracking-wider text-xs border ${expandedCategory === cat.name ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-gray-100'}`}
                  onClick={() => setExpandedCategory(expandedCategory === cat.name ? "" : cat.name)}
                >
                  {cat.name}
                </button>
                
                {expandedCategory === cat.name && (
                  <div className="border border-t-0 border-black p-2 flex flex-col gap-1 bg-gray-50">
                    {cat.indicators.map((ind: any) => (
                      <button
                        key={ind.id}
                        onClick={() => setSelectedIndicator(ind.slug)}
                        className={`text-left p-2 text-sm border border-transparent ${selectedIndicator === ind.slug ? 'font-bold border-l-4 border-l-black bg-white' : 'hover:bg-white hover:border-gray-200'}`}
                      >
                        {ind.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-black flex gap-2">
            <Link
              href={`/rover/compare?indicator=${encodeURIComponent(selectedIndicator || 'gdp-per-capita')}&countries=${selectedCountry ? `${selectedCountry},USA` : 'IND,USA'}`}
              className="flex-1 text-center bg-white text-black border border-black p-2 text-sm font-bold uppercase transition-colors hover:bg-gray-100"
              style={{ backgroundColor: "#ffffff", color: "#000000", textDecoration: "none" }}
            >
              Compare
            </Link>
            <Link
              href={`/rover/indicator/${encodeURIComponent(selectedIndicator || 'gdp-per-capita')}${selectedCountry ? `?countries=${encodeURIComponent(selectedCountry)}` : ''}`}
              className="flex-1 text-center bg-black text-white border border-black p-2 text-sm font-bold uppercase transition-colors hover:bg-gray-800"
              style={{ backgroundColor: "#000000", color: "#ffffff", textDecoration: "none" }}
            >
              Analyze
            </Link>
          </div>
        </div>

        {/* CENTER: 3D Globe OR Sub-National Map */}
        <div className="flex-grow relative flex flex-col bg-white">
          <div className="flex-grow relative w-full h-full cursor-move">
            {currentLevel === "country" ? (
              <Globe 
                mapData={mapData} 
                selectedCountryCode={selectedCountry}
                onCountryClick={handleCountryClick}
              />
            ) : (
              <SubNationalMap
                countryCode={selectedCountry || "IND"}
                level={currentLevel}
                parentPlaceId={activePlace?.id}
                activePlace={activePlace}
                onSelectPlace={handlePlaceSelect}
                colorBlindMode={colorBlindMode}
              />
            )}

            {renderLegend()}

            {loadingMap && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                <div className="font-mono text-sm border border-black px-4 py-2 bg-white">Loading data...</div>
              </div>
            )}
          </div>
          
          {/* Timeline Slider */}
          <div className="h-14 border-t border-black bg-white flex items-center px-6">
            <span className="font-mono text-sm mr-4 w-12">{selectedYear || '----'}</span>
            <input 
              type="range" 
              min="1990" 
              max="2026" 
              value={selectedYear || 2024} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="flex-grow h-2 bg-gray-200 appearance-none outline-none border border-black" 
              style={{ accentColor: "black" }}
            />
          </div>
        </div>

        {/* RIGHT AREA PANEL: Full Drill-down Tabs */}
        {activePlace && (
          <AreaPanel
            placeId={activePlace.id}
            placeSlug={activePlace.slug}
            placeName={activePlace.name}
            placeLevel={activePlace.level}
            onClose={() => setActivePlace(null)}
          />
        )}
      </div>
    </div>
  );
}
