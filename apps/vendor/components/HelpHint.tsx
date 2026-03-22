"use client";

import { Info } from "@phosphor-icons/react";

/** Accessible inline hint: icon + native tooltip (keyboard users see focus title on some browsers). */
export function HelpHint({ text }: { text: string }) {
  return (
    <span
      className="inline-flex align-middle text-slate-400 hover:text-slate-500 cursor-help ml-1"
      title={text}
      role="img"
      aria-label={text}
    >
      <Info size={16} weight="regular" aria-hidden />
    </span>
  );
}
