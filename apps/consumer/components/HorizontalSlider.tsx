"use client";

import { ReactNode } from "react";

interface HorizontalSliderProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalSlider({ children, className = "" }: HorizontalSliderProps) {
  return (
    <div className={`overflow-hidden rounded-[10px] ${className}`}>
      <div
        className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
