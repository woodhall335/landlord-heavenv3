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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute left-1/4 top-1/2 h-32 w-32 rotate-12 rounded-3xl border border-white/15" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className={clsx("flex flex-col gap-6", alignment)}>
          {breadcrumb && <div className="text-sm text-white/80">{breadcrumb}</div>}
          {eyebrow && (
            <div className="inline-flex items-center rounded-full bg-white/15 px-5 py-2 text-sm font-bold backdrop-blur-sm">
              {eyebrow}
            </div>
          )}
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl xl:text-6xl">
            {title}
          </h1>
          {subtitle && <p className="max-w-3xl text-xl text-white/90 sm:text-2xl font-medium">{subtitle}</p>}
          {actions && <div className="mt-6 flex flex-wrap items-center gap-4">{actions}</div>}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white" style={{ clipPath: "ellipse(120% 100% at 50% 100%)" }} />
    </section>
  );
}

export default TealHero;
