import React from "react";

interface FeatureSplitProps {
  title: string;
  subtitle?: string;
  body?: React.ReactNode;
  image?: React.ReactNode;
  reverse?: boolean;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export function FeatureSplit({ title, subtitle, body, image, reverse = false, eyebrow, actions }: FeatureSplitProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:gap-20">
        <div className={`flex-1 space-y-6 ${reverse ? "lg:order-2" : ""}`}>
          {eyebrow && (
            <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-primary">
              {eyebrow}
            </span>
          )}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
            {body && <div className="space-y-3 text-gray-600">{body}</div>}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className={`flex-1 rounded-2xl bg-gray-50 p-8 shadow-sm ring-1 ring-gray-200 ${reverse ? "lg:order-1" : ""}`}>
          {image}
        </div>
      </div>
    </section>
  );
}

export default FeatureSplit;
