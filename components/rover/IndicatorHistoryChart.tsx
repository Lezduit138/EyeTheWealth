/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface HistoryDataPoint {
  year: number;
  [countryCode: string]: number;
}

interface ChartProps {
  indicatorSlug: string;
  indicatorName: string;
  unit: string;
  countries?: string[];
}

export function IndicatorHistoryChart({ indicatorSlug, indicatorName, unit, countries: filterCountries }: ChartProps) {
  const [data, setData] = useState<HistoryDataPoint[]>([]);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/v1/rover/datapoints?indicator=${indicatorSlug}&pageSize=1000`);
        const json = await res.json();
        if (!json.success) {
          setLoading(false);
          return;
        }

        const rawData = json.data;
        const yearMap = new Map<number, HistoryDataPoint>();
        const countryMap = new Map<string, string>();

        rawData.forEach((dp: any) => {
          if (dp.value === null) return;
          if (filterCountries && filterCountries.length > 0 && !filterCountries.includes(dp.country.code)) return;
          
          countryMap.set(dp.country.code, dp.country.name);
          if (!yearMap.has(dp.year)) {
            yearMap.set(dp.year, { year: dp.year });
          }
          yearMap.get(dp.year)![dp.country.code] = dp.value;
        });

        const sortedData = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
        const countryList = Array.from(countryMap.entries()).map(([code, name]) => ({ code, name }));

        setData(sortedData);
        setCountries(countryList);
      } catch (err) {
        console.error("Failed to fetch chart data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [indicatorSlug, filterCountries]);

  if (loading) {
    return <div className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>Loading chart data...</div>;
  }

  if (data.length === 0) {
    return <div className="p-8 text-center etw-not-disclosed">No historical data available.</div>;
  }

  // Monochrome palette for lines
  const colors = ["#000000", "#444444", "#777777", "#aaaaaa", "#cccccc"];
  const dashArrays = ["", "5 5", "3 3", "10 5", "5 10"];

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
            tickMargin={10}
            stroke="var(--color-border-strong)"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
            tickFormatter={(value) => value.toLocaleString("en-US", { notation: "compact" })}
            stroke="var(--color-border-strong)"
            width={80}
          />
          <Tooltip
            contentStyle={{ borderRadius: 0, border: "1px solid #000", fontSize: "0.875rem" }}
            formatter={(value: number) => [value.toLocaleString("en-US", { maximumFractionDigits: 2 }) + (unit ? ` ${unit}` : ""), ""]}
            labelStyle={{ fontWeight: "bold", color: "#000", marginBottom: "0.5rem" }}
          />
          <Legend wrapperStyle={{ fontSize: "0.8125rem", paddingTop: "20px" }} />
          {countries.map((c, i) => (
            <Line
              key={c.code}
              type="monotone"
              dataKey={c.code}
              name={c.name}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              strokeDasharray={dashArrays[i % dashArrays.length]}
              dot={{ r: 3, fill: colors[i % colors.length] }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

