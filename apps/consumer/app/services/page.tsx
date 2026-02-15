"use client";

import Link from "next/link";
import {
  ForkKnife,
  Confetti,
  Armchair,
  MusicNotes,
  Camera,
  DotsThree,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const SERVICES = [
  { slug: "catering", name: "Catering", Icon: ForkKnife, available: true },
  { slug: "decor", name: "Decor", Icon: Confetti, available: false },
  { slug: "rentals", name: "Rentals", Icon: Armchair, available: false },
  { slug: "entertainment", name: "Entertainment", Icon: MusicNotes, available: false },
  { slug: "photography", name: "Photography", Icon: Camera, available: false },
  { slug: "misc", name: "Miscellaneous", Icon: DotsThree, available: false },
];

export default function ServicesPage() {
  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <h1 className="text-lg font-bold tracking-tight">Services</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Everything you need for your event
        </p>
      </header>

      <main className="p-6 pb-32">
        <div className="grid grid-cols-3 gap-3">
          {SERVICES.map((service) =>
            service.available ? (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex flex-col items-center p-3 border border-slate-100 rounded-none hover:bg-slate-50 transition-colors min-w-0"
              >
                <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center mb-2">
                  <service.Icon size={20} weight="regular" className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-center truncate w-full">
                  {service.name}
                </span>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase bg-confirmed/10 text-confirmed">
                  Available
                </span>
              </Link>
            ) : (
              <Link
                key={service.slug}
                href={`/services/coming-soon/${service.slug}`}
                className="flex flex-col items-center p-3 border border-slate-100 rounded-none opacity-75 min-w-0"
              >
                <div className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center mb-2">
                  <service.Icon size={20} weight="regular" className="text-slate-400" />
                </div>
                <span className="text-xs font-semibold text-center truncate w-full">
                  {service.name}
                </span>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                  Coming Soon
                </span>
              </Link>
            )
          )}
        </div>
      </main>
    </AppLayout>
  );
}
