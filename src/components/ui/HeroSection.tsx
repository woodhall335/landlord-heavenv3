import React from "react";
import { clsx } from "clsx";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  align?: "center" | "left";
  background?: "lavender" | "white" | "cream" | "dark";
  mediaSlot?: React.ReactNode;
  badge?: string;
}

export function HeroSection({
  title,
  subtitle,
  eyebrow,
  actions,
  breadcrumb,
  align = "center",
  background = "lavender",
  mediaSlot,
  badge,
}: HeroSectionProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  
  const bgClasses = {
    lavender: "bg-linear-to-br from-lavender-100 via-lavender-200 to-lavender-100",
    white: "bg-white",
    cream: "bg-cream",
    dark: "bg-linear-to-br from-gray-900 to-gray-800 text-white",
  };

  const textColor = background === "dark" ? "text-white" : "text-gray-900";
  const subtitleColor = background === "dark" ? "text-white/90" : "text-gray-700";

  return (
    <section className={clsx("relative overflow-hidden", bgClasses[background])}>
      {background === "lavender" && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-300/40 blur-3xl" />
          <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-16 md:px-10 md:pt-36 md:pb-36 lg:pt-40 lg:pb-36">
        <div className={clsx("grid gap-12", mediaSlot ? "lg:grid-cols-2 lg:items-center" : "")}>
          <div className={clsx("flex flex-col gap-6", !mediaSlot && alignment)}>
            {breadcrumb && (
              <div className={clsx("text-sm", background === "dark" ? "text-white/80" : "text-gray-600")}>
                {breadcrumb}
              </div>
            )}
            
            {eyebrow && (
              <div className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm px-5 py-2 text-sm font-bold shadow-md text-gray-900 border border-gray-200">
                {eyebrow}
              </div>
            )}

            {badge && (
              <div className="inline-flex items-center">
                <span className="rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-bold text-secondary uppercase tracking-wider">
                  {badge}
                </span>
              </div>
            )}
            
            <h1 className={clsx(
              "text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight",
              textColor
            )}>
              {title}
            </h1>
            
            {subtitle && (
              <p className={clsx(
                "max-w-2xl text-lg sm:text-xl lg:text-2xl font-normal leading-relaxed",
                subtitleColor
              )}>
                {subtitle}
              </p>
            )}
            
            {actions && (
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {actions}
              </div>
            )}
          </div>

          {mediaSlot && (
            <div className="relative">
              {mediaSlot}
            </div>
          )}
        </div>
      </div>

      {background !== "dark" && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent" />
      )}
    </section>
  );
}

export default HeroSection;
