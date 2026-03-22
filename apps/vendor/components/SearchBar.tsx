"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, CalendarCheck, Package, Spinner, CaretRight } from "@phosphor-icons/react";
import { API_URL, getNetworkErrorMessage, parseApiError, vendorFetch } from "@/lib/api";

interface SearchBooking {
  id: string;
  bookingReference: string;
  user: { name: string };
  event: { name: string; date: string };
  package: { name: string };
}

interface SearchPackage {
  id: string;
  name: string;
  imageUrl: string | null;
  basePrice: string;
  priceType: string;
}

interface SearchResults {
  bookings: SearchBooking[];
  packages: SearchPackage[];
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setSearchError(null);
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await vendorFetch(
        `${API_URL}/api/vendor/search?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        const data = await res.json().catch(() => ({}));
        setResults({ bookings: [], packages: [] });
        setSearchError(parseApiError(data as { error?: string; details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } }) || "Search failed");
      }
    } catch (err) {
      setResults({ bookings: [], packages: [] });
      setSearchError(getNetworkErrorMessage(err, "Unable to search. Try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  const hasResults =
    results &&
    (results.bookings.length > 0 || results.packages.length > 0);
  const showDropdown = open && query.length >= 2;

  const flatItems = useMemo(() => {
    if (!results || !hasResults) return [] as { href: string }[];
    const items: { href: string }[] = [];
    results.bookings.forEach((b) => items.push({ href: `/bookings/${b.id}` }));
    results.packages.forEach((p) => items.push({ href: `/packages/${p.id}/edit` }));
    return items;
  }, [results, hasResults]);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [query, results, searchError]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    setOpen(true);
    const t = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || flatItems.length === 0 || searchError) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => {
        if (i < 0) return 0;
        return Math.min(i + 1, flatItems.length - 1);
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && flatItems[highlightIndex]) {
        e.preventDefault();
        const href = flatItems[highlightIndex].href;
        setOpen(false);
        setQuery("");
        router.push(href);
      }
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <MagnifyingGlass
        size={20}
        weight="regular"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onKeyDown={handleInputKeyDown}
        placeholder="Search bookings, clients, packages..."
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? "vendor-search-results" : undefined}
        aria-autocomplete="list"
        className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-none rounded-full text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none"
      />
      {loading && (
        <Spinner
          size={18}
          weight="bold"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
        />
      )}

      {showDropdown && (
        <div
          id="vendor-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 max-h-[420px] overflow-y-auto"
        >
          {loading && !results ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Searching...
            </div>
          ) : searchError ? (
            <div className="p-8 text-center text-rose-600 text-sm">{searchError}</div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <div className="py-2">
              {(() => {
                let row = -1;
                return (
                  <>
                    {results!.bookings.length > 0 && (
                      <div className="px-3 py-1.5">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Bookings
                        </div>
                        {results!.bookings.map((b) => {
                          row += 1;
                          const hi = row;
                          return (
                            <Link
                              key={b.id}
                              href={`/bookings/${b.id}`}
                              role="option"
                              aria-selected={highlightIndex === hi}
                              onMouseEnter={() => setHighlightIndex(hi)}
                              onClick={() => {
                                setOpen(false);
                                setQuery("");
                              }}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                                highlightIndex === hi ? "bg-slate-100" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <CalendarCheck size={18} weight="regular" className="text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">
                                  {b.event.name} · {b.user.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {b.package.name} · {b.bookingReference}
                                </div>
                              </div>
                              <CaretRight
                                size={16}
                                weight="bold"
                                className="text-slate-300 group-hover:text-primary shrink-0"
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    {results!.packages.length > 0 && (
                      <div className="px-3 py-1.5 border-t border-slate-100">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Packages
                        </div>
                        {results!.packages.map((p) => {
                          row += 1;
                          const hi = row;
                          return (
                            <Link
                              key={p.id}
                              href={`/packages/${p.id}/edit`}
                              role="option"
                              aria-selected={highlightIndex === hi}
                              onMouseEnter={() => setHighlightIndex(hi)}
                              onClick={() => {
                                setOpen(false);
                                setQuery("");
                              }}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                                highlightIndex === hi ? "bg-slate-100" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package size={18} weight="regular" className="text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">{p.name}</div>
                                <div className="text-xs text-slate-500">
                                  {p.priceType === "per_person"
                                    ? `${parseFloat(p.basePrice).toFixed(2)} BD/person`
                                    : `${parseFloat(p.basePrice).toFixed(2)} BD fixed`}
                                </div>
                              </div>
                              <CaretRight
                                size={16}
                                weight="bold"
                                className="text-slate-300 group-hover:text-primary shrink-0"
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
