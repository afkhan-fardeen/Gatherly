"use client";

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav skeleton */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-[68px] flex items-center justify-between px-5 md:px-12 lg:px-20"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid rgba(109,13,53,0.08)",
        }}
      >
        <div className="h-9 w-[140px] rounded bg-slate-200/60 animate-pulse" />
        <div className="hidden md:flex gap-2">
          <div className="h-9 w-24 rounded-full bg-slate-200/60 animate-pulse" />
          <div className="h-9 w-20 rounded-full bg-slate-200/60 animate-pulse" />
        </div>
        <div className="md:hidden flex gap-1.5">
          <span className="w-[22px] h-[1.5px] rounded-sm bg-slate-300" />
          <span className="w-[22px] h-[1.5px] rounded-sm bg-slate-300" />
          <span className="w-[22px] h-[1.5px] rounded-sm bg-slate-300" />
        </div>
      </nav>

      {/* Hero skeleton */}
      <section className="min-h-screen grid lg:grid-cols-2 items-center pt-[68px] px-5 md:px-12 lg:px-20 gap-10 lg:gap-16">
        <div className="relative py-12 lg:py-24 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7 bg-slate-200/60 w-40 h-8 animate-pulse" />

          {/* Title lines */}
          <div className="space-y-3 mb-6">
            <div className="h-12 w-3/4 max-w-[280px] mx-auto lg:mx-0 rounded bg-slate-200/60 animate-pulse" />
            <div className="h-12 w-2/3 max-w-[220px] mx-auto lg:mx-0 rounded bg-slate-200/60 animate-pulse" />
            <div className="h-12 w-1/2 max-w-[180px] mx-auto lg:mx-0 rounded bg-slate-200/60 animate-pulse" />
          </div>

          {/* Description */}
          <div className="space-y-2 mb-10 max-w-[420px] mx-auto lg:mx-0">
            <div className="h-4 w-full rounded bg-slate-200/50 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-200/50 animate-pulse" />
            <div className="h-4 w-4/5 rounded bg-slate-200/50 animate-pulse" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-14 justify-center lg:justify-start">
            <div className="h-12 w-32 rounded-full bg-slate-200/60 animate-pulse" />
            <div className="h-12 w-24 rounded-full bg-slate-200/50 animate-pulse" />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-200/60 animate-pulse" />
              ))}
            </div>
            <div className="h-4 w-36 rounded bg-slate-200/50 animate-pulse" />
          </div>
        </div>

        {/* Hero visual skeleton */}
        <div className="relative flex items-center justify-center py-12 lg:py-20">
          <div className="w-full max-w-[340px] lg:max-w-[480px]">
            <div
              className="w-full aspect-[4/5] rounded-[28px] animate-pulse"
              style={{
                background: "linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* How it works section skeleton */}
      <section className="py-16 md:py-24 px-5 md:px-12 lg:px-20 bg-[#faf8f5]">
        <div className="text-center mb-16">
          <div className="h-3 w-24 rounded mx-auto mb-3 bg-slate-200/60 animate-pulse" />
          <div className="h-10 w-64 rounded mx-auto mb-3 bg-slate-200/60 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded mx-auto bg-slate-200/50 animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[24px] p-9 border border-slate-100">
              <div className="h-16 w-16 rounded bg-slate-200/60 animate-pulse mb-5" />
              <div className="h-8 w-3/4 rounded bg-slate-200/60 animate-pulse mb-2" />
              <div className="space-y-2 mt-4">
                <div className="h-3 w-full rounded bg-slate-200/50 animate-pulse" />
                <div className="h-3 w-full rounded bg-slate-200/50 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-slate-200/50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
