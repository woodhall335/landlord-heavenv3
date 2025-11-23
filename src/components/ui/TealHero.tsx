import React from "react";
import { clsx } from "clsx";

interface TealHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  align?: "center" | "left";
}

export function TealHero({
  title,
  subtitle,
  eyebrow,
  actions,
  breadcrumb,
  align = "center",
}: TealHeroProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-purple-900 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32 lg:py-40">
        <div className={clsx("flex flex-col gap-7", alignment)}>
          {breadcrumb && <div className="text-sm text-white/80">{breadcrumb}</div>}
          {eyebrow && (
            <div className="inline-flex items-center rounded-full bg-white/20 px-6 py-2.5 text-sm font-bold backdrop-blur-md shadow-lg">
              {eyebrow}
            </div>
          )}
          <h1 className="text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl xl:text-7xl tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="max-w-3xl text-xl text-white/95 sm:text-2xl font-normal leading-relaxed">{subtitle}</p>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
    </section>
  );
}

export default TealHero;
