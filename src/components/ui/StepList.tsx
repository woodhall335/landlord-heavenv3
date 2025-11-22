import React from "react";

export interface StepItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface StepListProps {
  title?: string;
  subtitle?: string;
  steps: StepItem[];
}

export function StepList({ title, subtitle, steps }: StepListProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        {(title || subtitle) && (
          <div className="mb-12 space-y-3 text-center">
            {title && <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </div>
        )}

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex gap-4 rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#009E9E] to-emerald-500 text-lg font-bold text-white">
                {step.icon ?? index + 1}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StepList;
