"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Storefront } from "@phosphor-icons/react";
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
    <div className="min-h-screen flex flex-col overflow-hidden bg-slate-50">
      <header className="px-6 py-5 flex justify-between items-center border-b border-slate-200 bg-white">
        <Logo href="/" className="text-2xl" />
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 max-w-2xl mx-auto w-full">
        <section className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-10">
            <Storefront size={40} weight="regular" className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-5">
            Vendor Portal
          </h1>
          <p className="text-slate-600 text-lg max-w-md mb-12">
            Manage your catering business, packages, and booking requests in one place.
          </p>
          <Link
            href="/register"
            className="px-10 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
        </section>

        <p className="text-slate-500 text-sm text-center mt-16">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}
