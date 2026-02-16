import { Suspense } from "react";
import { CateringContent } from "./CateringContent";

function CateringFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-10 w-32 bg-slate-100 rounded-md animate-pulse" />
      <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-md animate-pulse" />
      ))}
    </div>
  );
}

export default function CateringPage() {
  return (
    <Suspense fallback={<CateringFallback />}>
      <CateringContent />
    </Suspense>
  );
}
