import React from "react";
import { clsx } from "clsx";

interface CTASectionProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  background?: "dark" | "gradient";
  className?: string;
}

export function CTASection({
  title,
  subtitle,
  actions,
  background = "dark",
  className,
}: CTASectionProps) {
  const bgClasses = {
    dark: "bg-gray-900",
    gradient: "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900",
  };

  return (
    <div className={clsx(
      "rounded-3xl px-10 py-16 md:py-20 text-white shadow-2xl relative overflow-hidden",
      bgClasses[background],
      className
    )}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative grid gap-8 md:grid-cols-[2fr,1fr] md:items-center">
        <div className="space-y-5">
          <h3 className="text-4xl md:text-5xl font-black leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xl text-white/95 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-col gap-4 md:items-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default CTASection;
