// app/components/ConsultantSearch.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Consultant } from "@/types/consultant";

export default function ConsultantSearch() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .rpc("search_consultants", { q, p_limit: 12, p_offset: 0 })
        .abortSignal(controller.signal);

      if (!controller.signal.aborted) {
        if (error) {
          console.error(error);
          setResults([]);
          setOpen(false);
        } else {
          const rows = (data as Consultant[]) ?? [];
          console.log(rows);
          setResults(rows);
          setOpen(true);
        }
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, supabase]);

  return (
    // Make this container relative so the dropdown can be absolutely positioned.
    <div ref={boxRef} className="relative w-full max-w-sm">
      <input
        id="consultant-search"
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring"
        placeholder="Name, skill, or project..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        autoComplete="off"
      />

      {/* Floating dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-2 rounded-xl border bg-white shadow-lg
                     dark:bg-popover dark:text-popover-foreground"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
          )}

          {!loading && results.length > 0 && (
            <ul className="max-h-80 overflow-auto py-2">
              {results.map((c) => (
                <li
                  key={c.id}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-50 dark:hover:bg-accent/40"
                  onClick={() => {
                    window.location.href = `/dashboard/consultants/${c.id}`;
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.display_name}</div>
                    <span
                      className={`text-xs uppercase tracking-wide ${
                        c.availability_status === "available"
                          ? "text-green-600"
                          : c.availability_status === "partly"
                          ? "text-yellow-500"
                          : c.availability_status === "busy"
                          ? "text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      {c.availability_status ?? "unknown"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{c.title ?? "—"}</div>
                </li>
              ))}
            </ul>
          )}

          {!loading && results.length === 0 && query && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No consultants found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
