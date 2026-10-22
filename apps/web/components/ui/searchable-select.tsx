"use client";

import { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  allowCustom = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(opt: string) {
    onChange(opt);
    setSearch("");
    setIsOpen(false);
  }

  function handleAddCustom() {
    if (search.trim() && allowCustom) {
      onChange(search.trim());
      setSearch("");
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="flex min-h-[42px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {value ? (
          <span className="text-slate-900">{value}</span>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <svg className="ml-auto h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
                if (e.key === "Enter" && filtered.length > 0) {
                  handleSelect(filtered[0]);
                } else if (e.key === "Enter" && allowCustom && search.trim()) {
                  handleAddCustom();
                }
              }}
            />
          </div>
          <ul className="py-1">
            {filtered.map((opt) => (
              <li
                key={opt}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-slate-50 ${
                  opt === value ? "bg-blue-50 text-blue-700" : "text-slate-700"
                }`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </li>
            ))}
            {filtered.length === 0 && !allowCustom && (
              <li className="px-3 py-2 text-sm text-slate-400">No results found</li>
            )}
            {allowCustom && search.trim() && !options.includes(search.trim()) && (
              <li
                className="cursor-pointer border-t border-slate-100 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                onClick={handleAddCustom}
              >
                + Add "{search.trim()}"
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  validateCustom?: (value: string) => string | null;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Search and select...",
  allowCustom = false,
  validateCustom,
  className = "",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customError, setCustomError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(
    (opt) => opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAdd(opt: string) {
    onChange([...selected, opt]);
    setSearch("");
  }

  function handleRemove(opt: string) {
    onChange(selected.filter((s) => s !== opt));
  }

  function handleAddCustom() {
    const value = search.trim();
    if (!value || !allowCustom || selected.includes(value)) return;
    const error = validateCustom?.(value) ?? null;
    setCustomError(error ?? "");
    if (error) return;
    onChange([...selected, value]);
    setSearch("");
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="flex min-h-[42px] cursor-pointer flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {selected.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
          >
            {s}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(s);
              }}
              className="ml-0.5 text-blue-500 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-sm text-slate-400">{placeholder}</span>}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCustomError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
                if (e.key === "Enter" && filtered.length > 0) {
                  handleAdd(filtered[0]);
                } else if (e.key === "Enter" && allowCustom && search.trim()) {
                  handleAddCustom();
                }
              }}
            />
            {customError && <p className="mt-1.5 text-xs text-red-600">{customError}</p>}
          </div>
          <ul className="py-1">
            {filtered.slice(0, 20).map((opt) => (
              <li
                key={opt}
                className="cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => handleAdd(opt)}
              >
                {opt}
              </li>
            ))}
            {filtered.length === 0 && !allowCustom && (
              <li className="px-3 py-2 text-sm text-slate-400">No more options</li>
            )}
            {allowCustom && search.trim() && !options.includes(search.trim()) && !selected.includes(search.trim()) && (
              <li
                className="cursor-pointer border-t border-slate-100 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                onClick={handleAddCustom}
              >
                + Add "{search.trim()}"
              </li>
            )}
          </ul>
        </div>
      )}
      {!isOpen && customError && <p className="mt-1 text-xs text-red-600">{customError}</p>}
    </div>
  );
}
