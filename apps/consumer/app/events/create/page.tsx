"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { AppLayout } from "@/components/AppLayout";

const CreateEventContent = dynamic(
  () => import("./CreateEventContent").then((m) => ({ default: m.CreateEventContent })),
  {
    loading: () => (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#f4ede5] min-h-[40vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    ),
  }
);

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex-1 flex items-center justify-center bg-[#f4ede5] min-h-[40vh]">
            <p className="text-sm font-normal text-[#a0888d]">Loading...</p>
          </div>
        </AppLayout>
      }
    >
      <CreateEventContent />
    </Suspense>
  );
}
