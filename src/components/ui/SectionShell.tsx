import React from "react";
import { clsx } from "clsx";

interface SectionShellProps {
  children: React.ReactNode;
  background?: "white" | "lavender" | "cream" | "gray";
  padding?: "normal" | "large" | "none";
  className?: string;
}

export function SectionShell({
  children,
  background = "white",
  padding = "normal",
  className,
}: SectionShellProps) {
  const bgClasses = {
    white: "bg-white",
    lavender: "bg-lavender",
    cream: "bg-cream",
    gray: "bg-gray-50",
  };

  const paddingClasses = {
    none: "",
    normal: "py-16 md:py-20",
    large: "py-20 md:py-28",
  };

  return (
    <section className={clsx(bgClasses[background], paddingClasses[padding], className)}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {children}
      </div>
    </section>
  );
}

export default SectionShell;
