/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Globe from "@/components/rover/Globe";
import { Search } from "lucide-react";

export default function ClientDashboard({ categories }: { categories: any[] }) {
  const [selectedIndicator, setSelectedIndicator] = useState("gdp-per-capita");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  const [mapData, setMapData] = useState<any>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  
  const [countryStats, setCountryStats] = useState<any>(null);
  const [loadingCountry, setLoadingCountry] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>("Economy");

  // Fetch Map Data when indicator or year changes
  useEffect(() => {
    async function fetchMap() {
      setLoadingMap(true);
      try {
        let url = `/api/v1/rover/map?indicator=${selectedIndicator}`;
        if (selectedYear) url += `&year=${selectedYear}`;
        
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
  }, [selectedIndicator, selectedYear]);

  // Fetch Country Key Stats when country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setCountryStats(null);
      return;
    }
    
    async function fetchCountry() {
      setLoadingCountry(true);
      try {
        // We'll fetch the 5 key indicators: wealth-per-adult, gdp-per-capita, poverty-215-day, government-debt, life-expectancy
        const res = await fetch(`/api/v1/rover/series?entities=${selectedCountry}&indicator=gdp-per-capita`);
        // For MVP in this dashboard, we just need the latest values. We can use the /series endpoint or /analyze.
        // Actually, fetching analyze for all 5 might be heavy. Let's do a dedicated endpoint or Promise.all.
        // For now, let's just fetch gdp-per-capita series as a placeholder.
        const data = await res.json();
        if (data.success) {
          setCountryStats(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCountry(false);
      }
    }
    fetchCountry();
  }, [selectedCountry]);

  // Legend Component
  const renderLegend = () => {
    if (!mapData || !mapData.stats || !mapData.stats.breaks) return null;
    const { breaks } = mapData.stats;
    const isPositive = mapData.indicator?.polarity === "POSITIVE";
    const isNegative = mapData.indicator?.polarity === "NEGATIVE";
    
    let colors = ["#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#424242", "#212121"];
    if (isPositive) colors = ["#8b0000", "#cc0000", "#ff4444", "#aacc77", "#44aa44", "#006400"];
    if (isNegative) colors = ["#006400", "#44aa44", "#aacc77", "#ff4444", "#cc0000", "#8b0000"];

    return (
      <div className="absolute bottom-6 left-6 bg-white border border-black p-4 text-xs font-mono z-10 w-64 shadow-md">
        <div className="font-bold mb-1 uppercase text-black">{mapData.indicator?.name}</div>
        <div className="text-gray-600 mb-3">{mapData.year} · {mapData.indicator?.unit}</div>
        
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
            <div className="w-4 h-4 border border-black" style={{ backgroundColor: "#f0f0f0" }}></div>
            <span>No data</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-300 text-[10px] italic text-gray-500">
          {mapData.indicator?.polarityRationale}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white text-black font-sans">
      
      {/* LEFT PANEL: Indicators & Categories */}
      <div className="w-80 flex-shrink-0 border-r border-black flex flex-col bg-white overflow-hidden z-20">
        <div className="p-4 border-b border-black">
          <div className="flex items-center border border-black p-2 mb-2">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search indicator or country..." className="w-full text-sm outline-none bg-transparent" />
          </div>
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
          <Link href="/rover/compare" className="flex-1 text-center bg-white text-black border border-black p-2 text-sm font-bold uppercase hover:bg-gray-100">
            Compare
          </Link>
          <Link href={`/rover/indicator/${selectedIndicator}`} className="flex-1 text-center bg-black text-white border border-black p-2 text-sm font-bold uppercase hover:bg-gray-800">
            Analyze
          </Link>
        </div>
      </div>

      {/* CENTER: Globe & Timeline */}
      <div className="flex-grow relative flex flex-col bg-white">
        <div className="flex-grow relative w-full h-full cursor-move">
          <Globe 
            mapData={mapData} 
            selectedCountryCode={selectedCountry}
            onCountryClick={setSelectedCountry}
          />
          {renderLegend()}
          {loadingMap && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <div className="font-mono text-sm border border-black px-4 py-2 bg-white">Loading data...</div>
            </div>
          )}
        </div>
        
        {/* Timeline Slider */}
        <div className="h-16 border-t border-black bg-white flex items-center px-6">
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

      {/* RIGHT PANEL: Country Stats */}
      {selectedCountry && (
        <div className="w-80 flex-shrink-0 border-l border-black bg-white flex flex-col z-20">
          <div className="p-4 border-b border-black flex justify-between items-center bg-black text-white">
            <h2 className="font-bold text-xl">{selectedCountry}</h2>
            <button onClick={() => setSelectedCountry(null)} className="text-white hover:text-gray-300">✕</button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
            {loadingCountry ? (
              <div className="font-mono text-sm">Loading stats...</div>
            ) : (
              <>
                <div className="border border-black p-4">
                  <div className="text-xs uppercase text-gray-500 mb-1">Key Statistics</div>
                  <div className="font-bold text-lg mb-2">Country Overview</div>
                  <p className="text-sm text-gray-600 mb-4">Select &apos;Analyze&apos; to view deterministic metrics and contributing factors.</p>
                  
                  <Link href={`/rover/${selectedCountry.toLowerCase()}`} className="block w-full text-center bg-black text-white py-2 font-bold uppercase text-sm border border-black hover:bg-gray-800 transition-colors">
                    → Analyze Country
                  </Link>
                </div>
                
                {/* We can add mini charts or actual data here, but right now the Analyze page holds the detail */}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
