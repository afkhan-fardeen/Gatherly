"use client";

import { Check } from "@phosphor-icons/react";
import { getCurrentStepIndex } from "@/lib/bookingStatus";

interface OrderProgressProps {
  status: string;
  paymentStatus: string | null;
}

export function OrderProgress({ status, paymentStatus }: OrderProgressProps) {
  if (status === "cancelled") return null;

  const currentIndex = getCurrentStepIndex(status, paymentStatus);
  const paid = (paymentStatus || "unpaid") === "paid";

  const allSteps = [
    { label: "Request sent", done: currentIndex > 0, current: currentIndex === 0 },
    { label: "Confirmed", done: currentIndex > 1, current: currentIndex === 1 },
    { label: paid ? "Paid" : "Awaiting payment", done: paid, current: currentIndex === 2 },
    { label: "In preparation", done: currentIndex > 3, current: currentIndex === 3 },
    { label: "Delivered", done: currentIndex > 4, current: currentIndex === 4 },
    { label: "Completed", done: currentIndex >= 5, current: currentIndex === 5 },
  ];

  return (
    <div
      className="p-4 rounded-[20px] border border-primary/10 bg-white"
      style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
    >
      <h3 className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-3">
        Order status
      </h3>
      <p className="text-[12px] font-normal text-[#a0888d] mb-4">
        Track your catering order from request to delivery
      </p>
      <div className="space-y-2">
        {allSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold transition-colors ${
                step.done
                  ? "bg-emerald-500 text-white"
                  : step.current
                    ? "bg-primary text-white ring-2 ring-primary/30"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {step.done ? <Check size={14} weight="bold" /> : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={`text-[13px] font-medium ${
                  step.current ? "text-primary" : step.done ? "text-[#1e0f14]" : "text-[#9e8085]"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
