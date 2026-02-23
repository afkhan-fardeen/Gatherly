"use client";

import { useState } from "react";
import Image from "next/image";
import { API_URL } from "@/lib/api";

interface RemoteImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Rendered when src is empty or image fails to load */
  fallback?: React.ReactNode;
}

/**
 * Remote image (Cloudinary, API uploads, etc.) with:
 * - unoptimized so any domain works
 * - relative URL resolution (prepends API_URL for paths like /uploads/...)
 * - onError fallback when load fails
 */
export function RemoteImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className = "object-cover",
  sizes = "100vw",
  priority = false,
  fallback,
}: RemoteImageProps) {
  const [errored, setErrored] = useState(false);

  const resolvedSrc = (() => {
    const s = src?.trim();
    if (!s) return null;
    if (s.startsWith("/") && !s.startsWith("//")) {
      return `${API_URL.replace(/\/$/, "")}${s}`;
    }
    return s;
  })();

  if (!resolvedSrc) {
    return fallback ? <>{fallback}</> : null;
  }

  if (errored && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}
