import React from "react";

interface FeatureItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface FeatureGridProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  columns?: 2 | 3;
  items: FeatureItem[];
}

export function FeatureGrid({ eyebrow, title, subtitle, items, columns = 3 }: FeatureGridProps) {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center space-y-3">
          {eyebrow && (
            <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-[#009E9E]">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>

        <div className={`grid gap-6 md:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                {item.icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#009E9E]">
                    {item.icon}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  {item.badge && (
                    <span className="rounded-full bg-[#009E9E]/10 px-3 py-1 text-xs font-semibold text-[#009E9E]">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
