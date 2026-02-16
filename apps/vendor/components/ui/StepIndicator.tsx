"use client";

import { Check } from "@phosphor-icons/react";

interface StepIndicatorProps {
  steps: { label: string }[];
  currentStep: number; // 1-based
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex w-full items-center mb-8">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const connectorCompleted = currentStep > i;
        return (
          <div key={i} className={`flex items-center ${i < steps.length - 1 ? "flex-1 min-w-0" : "shrink-0"}`}>
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                    ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isCompleted ? <Check size={18} weight="bold" /> : stepNum}
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center ${
                  isCurrent ? "text-primary" : isCompleted ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 min-w-4 h-0.5 mx-1 ${
                  connectorCompleted ? "bg-primary" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
