"use client";

const BURGUNDY = "#3F0810";

interface BrandHeadingProps {
  className?: string;
}

export function BrandHeading({ className = "" }: BrandHeadingProps) {
  return (
    <h1
      className={`font-logo text-6xl font-normal tracking-tight ${className}`}
      style={{ color: BURGUNDY }}
    >
      Gatherlii
    </h1>
  );
}
