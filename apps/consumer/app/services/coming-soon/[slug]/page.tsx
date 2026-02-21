"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Confetti,
  Armchair,
  MusicNotes,
  Camera,
  DotsThree,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const SERVICE_NAMES: Record<
  string,
  { name: string; Icon: typeof Confetti }
> = {
  decor: { name: "Decor", Icon: Confetti },
  rentals: { name: "Rentals", Icon: Armchair },
  entertainment: { name: "Entertainment", Icon: MusicNotes },
  photography: { name: "Photography", Icon: Camera },
  misc: { name: "Miscellaneous", Icon: DotsThree },
};

export default function ComingSoonPage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = SERVICE_NAMES[slug] ?? { name: "Service", Icon: DotsThree };

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white px-6 py-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/services"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-radius-sm bg-slate-100 flex items-center justify-center"
          >
<ArrowLeft size={22} weight="regular" className="text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">
            {service.name}
          </h1>
        </div>
      </header>

      <main className="p-6 pb-32 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <service.Icon size={40} weight="regular" className="text-slate-400" />
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 mb-4">
          Coming Soon
        </span>
        <h2 className="text-xl font-bold text-center mb-2">
          {service.name} is on the way
        </h2>
        <p className="text-slate-500 text-center text-sm max-w-xs mb-8">
          We&apos;re working on bringing {service.name.toLowerCase()} to
          Gatherlii. Check back soon or browse our available services.
        </p>
        <Link
          href="/services"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-full"
        >
          Browse Services
        </Link>
      </main>
    </AppLayout>
  );
}
