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
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center space-y-4">
          {eyebrow && (
            <span className="inline-flex rounded-full bg-primary-subtle px-5 py-2 text-sm font-bold text-primary">
              {eyebrow}
            </span>
          )}
          <h2 className="text-4xl font-extrabold text-charcoal sm:text-5xl">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600 font-medium">{subtitle}</p>}
        </div>

        <div className={`grid gap-6 md:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex items-center gap-3">
                {item.icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle text-primary text-2xl">
                    {item.icon}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-charcoal">{item.title}</h3>
                  {item.badge && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 font-medium">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
