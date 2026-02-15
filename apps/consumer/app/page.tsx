"use client";

import Link from "next/link";
import { ForkKnife, Calendar, CalendarCheck } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";

const FEATURES = [
  {
    icon: ForkKnife,
    label: "Find caterers",
    description: "Browse top-rated catering vendors",
  },
  {
    icon: Calendar,
    label: "Manage events",
    description: "Create and organize your events",
  },
  {
    icon: CalendarCheck,
    label: "Book with confidence",
    description: "Secure bookings, easy management",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <header className="p-4 flex justify-between items-center border-b border-slate-100">
        <Logo />
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-none hover:bg-primary/90"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-12 max-w-md md:max-w-4xl mx-auto w-full">
        <section className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl font-bold text-center mb-4">
            Plan your event.
            <br />
            <span className="text-primary">Book the best services.</span>
          </h1>
          <p className="text-slate-600 text-center max-w-md mb-8">
            Browse caterers, create events, manage guests, and book with
            confidence.
          </p>
          <Link
            href="/register"
            className="px-8 py-3 bg-primary text-white font-semibold rounded-none hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </section>

        <section className="w-full mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-4 rounded-none border border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center mb-3">
                  <Icon size={24} weight="regular" className="text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900">{label}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-slate-500 text-sm text-center">
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
