"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const PROMPTS = [
  { label: "Calculus Prep", q: "Calculus" },
  { label: "Spanish Tutor", q: "Spanish" },
  { label: "Python Help", q: "Python" },
];

export function HomeHeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("ALL");

  function go(query: string) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (mode !== "ALL") params.set("mode", mode);
    router.push(`/tutors?${params.toString()}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    go(q);
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 rounded-2xl bg-white p-1.5 shadow-lg sm:flex-row sm:items-center sm:rounded-full sm:p-2"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-2">
          <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Subject or skill (e.g. Mathematics, Physics, English)"
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search tutors"
          />
        </div>
        <div className="hidden items-center gap-2 border-l border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 md:flex">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="cursor-pointer bg-transparent text-xs text-slate-700 focus:outline-none"
            aria-label="Teaching mode"
          >
            <option value="ALL">All Modes</option>
            <option value="ONLINE">Online</option>
            <option value="HOME">Home Tutor</option>
            <option value="ASSIGNMENT">Assignment</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-2.5 text-sm font-bold text-white hover:bg-[rgb(var(--wtws-blue-dark))] sm:rounded-full"
        >
          Search
          <span aria-hidden>→</span>
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-blue-100">
        <span className="font-medium opacity-80">Popular:</span>
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => go(p.q)}
            className="rounded-md bg-white/10 px-2 py-0.5 transition hover:bg-white/20"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
