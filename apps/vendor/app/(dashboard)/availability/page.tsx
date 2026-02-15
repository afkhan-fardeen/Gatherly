"use client";

import { useEffect, useState } from "react";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/vendor/availability`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { blockedDates: [] }))
      .then((data) => {
        setBlockedDates(data.blockedDates ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveBlockedDates(dates: string[]) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/vendor/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blockedDates: dates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setBlockedDates(data.blockedDates ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function toggleDate(dateStr: string) {
    const next = blockedDates.includes(dateStr)
      ? blockedDates.filter((d) => d !== dateStr)
      : [...blockedDates, dateStr].sort();
    setBlockedDates(next);
    saveBlockedDates(next);
  }

  const firstDay = new Date(month.year, month.month, 1);
  const lastDay = new Date(month.year, month.month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    setMonth((m) =>
      m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
    );
  };
  const nextMonth = () => {
    setMonth((m) =>
      m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
    );
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <VendorLayout>
        <div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-100 rounded-lg w-48" />
            <div className="h-80 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div>
        <PageHeader
          title="Availability"
          subtitle="Mark dates when you're unavailable for bookings."
        />

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="p-6 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold text-slate-900">
              {new Date(month.year, month.month).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - startPad + 1;
              const isInMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const dateStr = isInMonth
                ? toYMD(new Date(month.year, month.month, dayNum))
                : "";
              const isBlocked = dateStr && blockedDates.includes(dateStr);
              const isPast =
                dateStr && new Date(dateStr) < new Date(toYMD(new Date()));

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => isInMonth && !isPast && toggleDate(dateStr)}
                  disabled={Boolean(!isInMonth || isPast)}
                  className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                    !isInMonth
                      ? "invisible"
                      : isPast
                      ? "text-slate-300 cursor-not-allowed"
                      : isBlocked
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isInMonth ? dayNum : ""}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Click a date to mark it unavailable. Click again to remove. Gray dates are in the past.
          </p>
        </div>
      </div>
    </VendorLayout>
  );
}
