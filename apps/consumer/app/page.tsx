"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkle, MagnifyingGlass, Palette, CheckCircle } from "@phosphor-icons/react";
import { validateSession, getToken } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    validateSession().then((result) => {
      if (cancelled) return;
      if (result.valid) {
        router.replace("/dashboard");
        return;
      }
      setToken(getToken());
    }).finally(() => {
      if (!cancelled) setChecking(false);
    });
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-slate-900 flex flex-col">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkle size={22} weight="fill" className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Gatherlii</span>
          </Link>
          <div className="flex items-center gap-3">
            {checking ? null : token ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-primary border border-primary hover:bg-primary/5 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-primary shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section - 2-col on desktop */}
        <section className="relative py-16 md:py-20 lg:py-28 px-6 md:px-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6 md:mb-8">
                  <CheckCircle size={14} weight="fill" />
                  Premium Event Planning
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900 tracking-tight mb-6 max-w-2xl">
                  Elegance in Every Detail.{" "}
                  <span className="text-primary italic">Planning</span> Made Perfect.
                </h1>
                <p className="text-lg text-slate-600 max-w-xl mb-8 md:mb-10 leading-relaxed">
                  Experience a premium approach to event planning and coordination. Discover curated vendors, create memorable events, and manage everything in one place.
                </p>
                <div className="flex flex-wrap gap-4">
                  {checking ? null : token ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-primary shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-[0.98]"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-primary shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-[0.98]"
                      >
                        Get Started
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        Log In
                      </Link>
                    </>
                  )}
                </div>
              </div>
              {/* Desktop: decorative right side */}
              <div className="hidden lg:block relative mt-12 lg:mt-0">
                <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] rotate-3" />
                <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border border-slate-200/50 flex items-center justify-center">
                  <Sparkle size={120} weight="fill" className="text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 md:py-20 lg:py-24 bg-white border-y border-slate-200">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-slate-600">
                A streamlined process for planning your perfect event.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10 md:gap-12">
              <div className="group">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MagnifyingGlass size={28} weight="regular" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Discover</h3>
                <p className="text-slate-600 leading-relaxed">
                  Browse curated venues and vendors tailored to your vision and budget.
                </p>
              </div>
              <div className="group">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Palette size={28} weight="regular" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Plan</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create your event, manage guests, and coordinate every detail in one place.
                </p>
              </div>
              <div className="group">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <CheckCircle size={28} weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Enjoy</h3>
                <p className="text-slate-600 leading-relaxed">
                  Book catering, track orders, and enjoy a seamless event from start to finish.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 lg:py-24 px-6 md:px-8 bg-primary/5">
          <div className="w-full max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Plan your first event
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Join event planners using Gatherlii to create unforgettable experiences.
            </p>
            {!checking && !token && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-10 py-4 rounded-2xl font-bold text-lg text-white bg-primary shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="px-10 py-4 rounded-2xl font-bold text-lg text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-12 px-6 md:px-8 shrink-0">
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkle size={16} weight="fill" className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Gatherlii</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Gatherlii. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
