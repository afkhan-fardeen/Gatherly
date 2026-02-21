"use client";

import Image from "next/image";
import { Calendar } from "@phosphor-icons/react";

interface EventImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  fallbackIcon?: React.ReactNode;
}

/** Event image with unoptimized fallback so external URLs (Cloudinary, etc.) always display */
export function EventImage({
  src,
  alt,
  className = "object-cover",
  fill = true,
  sizes = "100px",
  fallbackIcon,
}: EventImageProps) {
  if (!src?.trim()) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-section-alt)]">
        {fallbackIcon ?? <Calendar size={24} className="text-primary" />}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      unoptimized
    />
  );
}
