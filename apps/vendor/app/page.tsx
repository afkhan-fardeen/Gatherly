"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Storefront,
  PlayCircle,
  CalendarCheck,
  Package,
  ChartLine,
} from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";

export default function VendorLandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (token && stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.role === "vendor") router.replace("/dashboard");
      } catch {
        // ignore
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo href="/" className="text-2xl font-extrabold tracking-tight text-slate-900" />
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-full">
              Vendor
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-md shadow-primary/20"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-20">
        <section className="relative py-24 sm:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
          </div>
          <div className="max-w-4xl px-6 mx-auto">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Empower Your <span className="text-primary">Event Business</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Manage bookings, packages, and clients seamlessly in one place. Scale your operations
              with the platform built for growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold text-lg rounded-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
              >
                Get Started for Free
              </Link>
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle size={20} weight="fill" />
                Watch Demo
              </button>
            </div>
            <p className="mt-12 text-slate-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </section>

        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Designed specifically for vendors in the event industry to simplify their daily
                operations and focus on what matters.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CalendarCheck size={28} weight="regular" className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Streamlined Bookings</h3>
                <p className="text-slate-600 leading-relaxed">
                  Handle all your client inquiries and confirmations in a centralized dashboard. Never
                  double-book again.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package size={28} weight="regular" className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Package Management</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create and customize service packages. Effortlessly update pricing and availability
                  in real-time.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ChartLine size={28} weight="regular" className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Analytics</h3>
                <p className="text-slate-600 leading-relaxed">
                  Track your revenue, popular packages, and client conversion rates with our powerful
                  reporting tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative bg-primary rounded-3xl p-12 sm:p-20 text-center text-white overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Storefront size={120} weight="regular" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 relative z-10">
                Ready to take your business to the next level?
              </h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
                Join top event professionals using Gatherly to manage their business more
                effectively.
              </p>
              <Link
                href="/register"
                className="inline-block bg-white text-primary font-bold px-10 py-4 rounded-2xl hover:bg-slate-50 transition-colors shadow-lg shadow-black/10 relative z-10"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
                Gatherly
              </div>
              <p className="text-slate-500 text-sm">Empowering the event industry since 2023.</p>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-600">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs">
            © 2023 Gatherly Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
