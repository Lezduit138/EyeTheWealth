"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  gdpHistory: { year: number; value: number }[];
  countryName: string;
}

export default function CountryCharts({ gdpHistory, countryName }: Props) {
  const formatValue = (v: number) => {
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  };

  return (
    <div style={{ border: "1px solid #000", padding: "1.5rem", background: "#fff" }}>
      <div style={{ marginBottom: "0.5rem", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "#666" }}>
        GDP PER CAPITA (USD) · {countryName} · World Bank
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={gdpHistory} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#666" }} tickLine={false} />
            <YAxis tickFormatter={formatValue} tick={{ fontSize: 11, fill: "#666" }} tickLine={false} width={64} />
            <Tooltip
              formatter={(value: number) => [formatValue(value), "GDP per Capita"]}
              contentStyle={{ border: "1px solid #000", borderRadius: 0, fontSize: 12, background: "#fff" }}
            />
            <Line type="monotone" dataKey="value" stroke="#000" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#000" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: "0.5rem", fontSize: "0.6875rem", color: "#999" }}>
        Source: World Bank Open Data · <a href="https://data.worldbank.org/indicator/NY.GDP.PCAP.CD" target="_blank" rel="noopener noreferrer" style={{ color: "#666" }}>NY.GDP.PCAP.CD</a>
      </div>
    </div>
  );
}
