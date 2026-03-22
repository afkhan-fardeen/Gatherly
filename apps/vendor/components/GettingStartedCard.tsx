"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, X, Package, UserCircle } from "@phosphor-icons/react";

const STORAGE_KEY = "vendor_getting_started_dismissed";

export interface GettingStartedState {
  activePackageCount: number;
  profileComplete: boolean;
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function useGettingStartedDismissed(): [boolean, () => void] {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(readDismissed());
  }, []);
  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }, []);
  return [dismissed, dismiss];
}

export function GettingStartedCard({
  activePackageCount,
  profileComplete,
}: GettingStartedState) {
  const [dismissed, dismiss] = useGettingStartedDismissed();

  if (dismissed) return null;

  const steps = [
    {
      done: activePackageCount > 0,
      label: "Publish a package",
      hint: "Customers book from your active packages.",
      href: "/packages/new",
      cta: "Add package",
      Icon: Package,
    },
    {
      done: profileComplete,
      label: "Complete your profile",
      hint: "Add a description and logo so customers trust your business.",
      href: "/profile",
      cta: "Edit profile",
      Icon: UserCircle,
    },
  ];

  if (steps.every((s) => s.done)) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Get started</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Finish these steps so customers can find and book your catering.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Dismiss getting started"
        >
          <X size={20} weight="bold" />
        </button>
      </div>
      <ul className="mt-5 space-y-3">
        {steps.map((s) => (
          <li
            key={s.label}
            className={`flex items-start gap-3 p-3 rounded-xl border ${
              s.done ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                s.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {s.done ? <CheckCircle size={18} weight="fill" /> : <s.Icon size={18} weight="regular" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.hint}</p>
              {!s.done && (
                <Link
                  href={s.href}
                  className="inline-block mt-2 text-sm font-semibold text-primary hover:underline"
                >
                  {s.cta}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        Optional: block dates you cannot cater on the{" "}
        <Link href="/availability" className="font-medium text-primary hover:underline">
          Unavailable dates
        </Link>{" "}
        page.
      </p>
    </div>
  );
}
