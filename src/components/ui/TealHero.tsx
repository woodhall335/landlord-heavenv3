import React from "react";
import Image from "next/image";
import { clsx } from "clsx";

interface TealHeroProps {
  title: string;
  subtitle?: React.ReactNode;
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
    <section className="relative overflow-hidden text-gray-900">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg5.webp"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-16 md:px-10 md:pt-32 md:pb-20">
        <div className={clsx("flex flex-col gap-7", alignment)}>
          {breadcrumb && <div className="text-sm text-gray-600">{breadcrumb}</div>}
          {eyebrow && (
            <div className="inline-flex items-center rounded-full bg-white/80 px-6 py-2.5 text-sm font-bold backdrop-blur-md shadow-md text-gray-900">
              {eyebrow}
            </div>
          )}
          <h1 className="text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl xl:text-7xl tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && <div className="max-w-3xl text-xl text-gray-700 sm:text-2xl font-normal leading-relaxed">{subtitle}</div>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

export default TealHero;
