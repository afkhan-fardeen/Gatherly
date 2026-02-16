"use client";

import { Check } from "@phosphor-icons/react";
import { ORDER_STEPS, getCurrentStepIndex } from "@/lib/bookingStatus";

interface OrderProgressProps {
  status: string;
  paymentStatus: string | null;
}

export function OrderProgress({ status, paymentStatus }: OrderProgressProps) {
  const currentIndex = getCurrentStepIndex(status, paymentStatus);
  if (currentIndex < 0) return null;

  return (
    <div className="p-4 border border-slate-100 rounded-md bg-slate-50/50">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Order progress
      </h3>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {ORDER_STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={i} className="flex items-center shrink-0">
              <div className="flex flex-col items-center min-w-[4rem]">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                      ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check size={16} weight="bold" /> : i + 1}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold text-center leading-tight ${
                    isCurrent ? "text-primary" : isCompleted ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < ORDER_STEPS.length - 1 && (
                <div
                  className={`w-4 sm:w-6 h-0.5 mx-0.5 ${
                    isCompleted ? "bg-primary" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
