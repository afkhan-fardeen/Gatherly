"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";

const BURGUNDY = "#3F0810";
const THRESHOLD = 70;

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return;
      const el = document.scrollingElement ?? document.documentElement;
      if (el.scrollTop > 0) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        setPullY(Math.min(delta * 0.5, THRESHOLD * 1.2));
      }
    },
    [refreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(0);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    } else {
      setPullY(0);
    }
  }, [pullY, refreshing, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-full"
    >
      {(pullY > 0 || refreshing) && (
        <div
          className="flex items-center justify-center py-3 text-sm font-medium transition-opacity"
          style={{
            color: BURGUNDY,
            height: refreshing ? 48 : Math.min(pullY, THRESHOLD),
            opacity: refreshing ? 1 : pullY / THRESHOLD,
          }}
        >
          {refreshing ? (
            <span className="flex items-center gap-2">
              <ArrowClockwise size={18} weight="bold" className="animate-spin" />
              Refreshing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ArrowClockwise size={18} weight="bold" />
              Pull to refresh
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
