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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#009E9E] to-teal-700 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute left-1/4 top-1/2 h-32 w-32 rotate-12 rounded-3xl border border-white/15" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <div className={clsx("flex flex-col gap-4", alignment)}>
          {breadcrumb && <div className="text-sm text-white/80">{breadcrumb}</div>}
          {eyebrow && (
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
            {title}
          </h1>
          {subtitle && <p className="max-w-3xl text-lg text-white/85 sm:text-xl">{subtitle}</p>}
          {actions && <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white" style={{ clipPath: "ellipse(120% 100% at 50% 100%)" }} />
    </section>
  );
}

export default TealHero;
