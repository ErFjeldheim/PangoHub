"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Consultant, AvailabilityStatus } from "@/types/consultant";
import { Search, Loader2, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { searchConsultants } from "@/app/actions/consultants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ConsultantSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (boxRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchConsultants(q);
        setResults(data);
        setOpen(true);
      } catch (error) {
        console.error(error);
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    if (!open || !inputRef.current) return;

    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, results.length, loading]);

  const getAvailabilityConfig = (
    status: AvailabilityStatus | null | undefined,
  ) => {
    switch (status) {
      case "available":
        return {
          variant: "default" as const,
          label: "Available",
          className:
            "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800",
        };
      case "partly":
        return {
          variant: "secondary" as const,
          label: "Partly Available",
          className:
            "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800",
        };
      case "busy":
        return {
          variant: "secondary" as const,
          label: "Busy",
          className:
            "bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800",
        };
      default:
        return {
          variant: "outline" as const,
          label: "Unknown",
          className: "bg-muted/50",
        };
    }
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div ref={inputRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="consultant-search"
          className="pl-10 pr-10 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
          placeholder={t.header.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Floating dropdown */}
      {open &&
        dropdownStyle &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-lg border border-border bg-card shadow-xl
                     animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
            style={{
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
            }}
          >
            {!loading && results.length > 0 && (
              <div className="max-h-[400px] overflow-auto">
                <div className="p-2 space-y-1">
                  {results.map((c) => {
                    const availConfig = getAvailabilityConfig(
                      c.availability_status,
                    );
                    const name = c.display_name || "Unnamed";

                    return (
                      <Link
                        key={c.id}
                        href={`/dashboard/consultants/${c.id}`}
                        className="block"
                        onClick={() => {
                          setQuery("");
                          setOpen(false);
                        }}
                      >
                        <div
                          className="w-full px-3 py-3 rounded-md hover:bg-accent/50 transition-colors
                                   focus:outline-none focus:bg-accent/50 group"
                        >
                          <div className="flex items-start gap-3">
                            {/* Simple icon instead of avatar */}
                            <div className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                              <UserIcon className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                  {name}
                                </h4>
                                <Badge
                                  variant={availConfig.variant}
                                  className={`text-xs shrink-0 ${availConfig.className}`}
                                >
                                  {availConfig.label}
                                </Badge>
                              </div>
                              {c.title && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {c.title}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t px-3 py-2 bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center">
                    {t.header.showingResults
                      .replace("{count}", String(results.length))
                      .replace("{s}", results.length !== 1 ? "s" : "")}
                  </p>
                </div>
              </div>
            )}

            {!loading && results.length === 0 && query && (
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {t.header.noResults}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.header.tryAdjusting}
                </p>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
