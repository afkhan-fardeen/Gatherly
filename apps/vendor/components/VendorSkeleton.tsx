/**
 * Shared loading placeholders for the vendor dashboard (consistent pulse + radii).
 */

const pulse = "animate-pulse bg-slate-100";

export function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`${pulse} ${className}`.trim()} aria-hidden />;
}

/** Full-width list row — default h-20, rounded-xl (recent bookings, notifications). */
export function SkeletonListRow({
  className = "h-20 rounded-xl",
}: {
  className?: string;
}) {
  return <SkeletonBox className={className} />;
}

/** Taller package-style row. */
export function SkeletonPackageRow() {
  return <SkeletonBox className="h-24 rounded-xl" />;
}

/** Bookings tab list card. */
export function SkeletonBookingCard() {
  return <SkeletonBox className="h-32 rounded-xl" />;
}

/** Title line + main panel (profile, edit package, booking detail, availability, reviews). */
export function SkeletonFormPage({
  panelHeight = "h-64",
}: {
  panelHeight?: "h-64" | "h-80";
}) {
  return (
    <div className="space-y-4" aria-hidden>
      <SkeletonBox className="h-8 rounded-lg w-48" />
      <SkeletonBox className={`${panelHeight} rounded-xl`} />
    </div>
  );
}

/** Reviews page initial load (header + summary strip). */
export function SkeletonReviewsPage() {
  return (
    <div className="space-y-4" aria-hidden>
      <SkeletonBox className="h-8 rounded-lg w-48" />
      <SkeletonBox className="h-32 rounded-xl" />
    </div>
  );
}

/** Spotlight page: two stacked blocks. */
export function SkeletonSpotlightPage() {
  return (
    <div className="space-y-6" aria-hidden>
      <SkeletonBox className="h-24 rounded-xl" />
      <SkeletonBox className="h-32 rounded-xl" />
    </div>
  );
}

/** Recent bookings strip on dashboard (3 rows). */
export function SkeletonRecentBookings({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonListRow key={i} />
      ))}
    </div>
  );
}
