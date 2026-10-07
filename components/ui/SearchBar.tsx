/* eslint-disable */
"use client";

// ETW â€” SearchBar with autocomplete suggestions

import React, { useState, useRef, useEffect } from "react";

interface Suggestion {
  id: string;
  label: string;
  sublabel?: string;
  href?: string;
}

interface SearchBarProps {
  placeholder?: string;
  suggestions?: Suggestion[];
  onSearch?: (query: string) => void;
  onSelect?: (suggestion: Suggestion) => void;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
}

export function SearchBar({
  placeholder = "Search...",
  suggestions = [],
  onSearch,
  onSelect,
  value: controlledValue,
  onChange,
  className = "",
  id = "etw-search",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (onChange) onChange(v);
    else setInternalValue(v);
    setShowSuggestions(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex]);
      } else if (onSearch) {
        onSearch(value);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (onChange) onChange(suggestion.label);
    else setInternalValue(suggestion.label);
    setShowSuggestions(false);
    setActiveIndex(-1);
    if (onSelect) onSelect(suggestion);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className={`relative ${className}`} role="combobox" aria-haspopup="listbox" aria-expanded={showSuggestions}>
      <div className="flex">
        <label htmlFor={id} className="sr-only">
          {placeholder}
        </label>
        <input
          ref={inputRef}
          id={id}
          type="search"
          className="etw-input flex-1"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && setShowSuggestions(true)}
          onBlur={handleBlur}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={activeIndex >= 0 ? `${id}-suggestion-${activeIndex}` : undefined}
        />
        <button
          type="button"
          className="etw-btn etw-btn-filled"
          style={{ padding: "0.625rem 1.25rem", flexShrink: 0 }}
          onClick={() => { if (onSearch) onSearch(value); setShowSuggestions(false); }}
          aria-label="Search"
        >
          Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute z-50 w-full mt-0 bg-white border border-black"
          style={{ maxHeight: "280px", overflowY: "auto", top: "100%" }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`${id}-suggestion-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className="px-4 py-3 cursor-pointer text-sm border-b last:border-b-0 border-gray-100"
              style={{
                background: i === activeIndex ? "#000" : "#fff",
                color: i === activeIndex ? "#fff" : "#000",
              }}
              onMouseDown={() => handleSelectSuggestion(s)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="font-medium">{s.label}</div>
              {s.sublabel && (
                <div
                  className="text-xs mt-0.5"
                  style={{ color: i === activeIndex ? "#ccc" : "var(--color-text-muted)" }}
                >
                  {s.sublabel}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

