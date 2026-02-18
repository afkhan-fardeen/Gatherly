"use client";

const CHERRY = "#6D0D35";

interface BrandHeadingProps {
  className?: string;
}

export function BrandHeading({ className = "" }: BrandHeadingProps) {
  return (
    <h1
      className={`text-6xl font-normal tracking-tight ${className}`}
      style={{ color: CHERRY }}
    >
      Gatherlii
    </h1>
  );
}
