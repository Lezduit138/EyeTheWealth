"use client";

// ETW — DataTable Component
// Accessible, sortable table with pagination

import React, { useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField?: string;
  caption?: string;
  emptyMessage?: string;
  pageSize?: number;
  className?: string;
  stickyHeader?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField = "id",
  caption,
  emptyMessage = "No data available.",
  pageSize = 25,
  className = "",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    if (typeof av === "number" && typeof bv === "number")
      return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={className}>
      <div style={{ overflowX: "auto" }}>
        <table className="etw-table" aria-label={caption}>
          {caption && (
            <caption
              className="etw-label text-left pb-2"
              style={{ captionSide: "top" }}
            >
              {caption}
            </caption>
          )}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 etw-label hover:opacity-70 transition-opacity"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        <span aria-hidden="true">{sortDir === "asc" ? " ↑" : " ↓"}</span>
                      ) : (
                        <span aria-hidden="true" style={{ opacity: 0.3 }}>
                          {" ↕"}
                        </span>
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 etw-not-disclosed"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr key={String(row[keyField] ?? i)}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row, i)
                        : row[col.key] !== null && row[col.key] !== undefined
                        ? String(row[col.key])
                        : <span className="etw-not-disclosed">Not publicly disclosed</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span className="etw-label" style={{ color: "var(--color-text-muted)" }}>
            Page {page} of {totalPages} · {data.length} records
          </span>
          <div className="flex gap-2">
            <button
              className="etw-btn etw-btn-ghost"
              style={{ padding: "0.375rem 0.75rem" }}
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              ← Prev
            </button>
            <button
              className="etw-btn etw-btn-ghost"
              style={{ padding: "0.375rem 0.75rem" }}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
