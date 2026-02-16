"use client";

import Link from "next/link";
import Image from "next/image";
import { AppLayout } from "@/components/AppLayout";

const SERVICES = [
  { slug: "catering", name: "Catering", image: "/images/services/catering.jpg", available: true },
  { slug: "decor", name: "Decor", image: "/images/services/decor.jpg", available: false },
  { slug: "rentals", name: "Rentals", image: "/images/services/rentals.jpg", available: false },
  { slug: "entertainment", name: "Entertainment", image: "/images/services/entertainment.jpg", available: false },
  { slug: "photography", name: "Photography", image: "/images/services/photography.jpg", available: false },
  { slug: "misc", name: "Miscellaneous", image: "/images/services/pexels-gcman105-916416.jpg", available: false },
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SERVICES.map((service) =>
            service.available ? (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group flex flex-col overflow-hidden border border-slate-100 rounded-md hover:border-slate-200 transition-colors min-w-0 p-0"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 text-sm font-semibold text-white drop-shadow-sm">
                    {service.name}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-confirmed/90 text-white">
                    Available
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                key={service.slug}
                href={`/services/coming-soon/${service.slug}`}
                className="group flex flex-col overflow-hidden border border-slate-100 rounded-md opacity-90 hover:opacity-100 transition-opacity min-w-0 p-0"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-slate-900/40" />
                  <span className="absolute bottom-2 left-2 right-2 text-sm font-semibold text-white drop-shadow-sm">
                    {service.name}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-700/90 text-white">
                    Coming Soon
                  </span>
                </div>
              </Link>
            )
          )}
        </div>
      </main>
    </AppLayout>
  );
}
