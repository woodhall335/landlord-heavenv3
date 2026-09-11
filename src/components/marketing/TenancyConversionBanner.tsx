import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Download,
  FileCheck2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

type TenancyBannerIcon = 'calendar' | 'check' | 'download' | 'file' | 'jurisdiction' | 'shield';

interface TenancyConversionBannerProps {
  eyebrow: string;
  title: string;
  highlightedText: string;
  description: string;
  artworkSrc: string;
  artworkAlt: string;
  features: Array<{
    icon: TenancyBannerIcon;
    title: string;
    body: string;
  }>;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  footnote: string;
}

const featureIcons: Record<TenancyBannerIcon, typeof FileCheck2> = {
  calendar: CalendarCheck2,
  check: CheckCircle2,
  download: Download,
  file: FileCheck2,
  jurisdiction: MapPin,
  shield: ShieldCheck,
};

export function TenancyConversionBanner({
  eyebrow,
  title,
  highlightedText,
  description,
  artworkSrc,
  artworkAlt,
  features,
  primary,
  secondary,
  footnote,
}: TenancyConversionBannerProps) {
  const highlightIndex = title.indexOf(highlightedText);
  const titleLead = highlightIndex >= 0 ? title.slice(0, highlightIndex).trim() : title;

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16" data-tenancy-jurisdiction-banner>
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[radial-gradient(circle_at_78%_42%,rgba(139,92,246,0.52),transparent_35%),linear-gradient(135deg,#171236_0%,#2D1761_56%,#4C1D95_100%)] px-6 py-8 text-white shadow-[0_30px_80px_rgba(46,29,86,0.28)] sm:px-9 sm:py-10 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,transparent_0%,transparent_46%,rgba(255,255,255,0.06)_46%,rgba(255,255,255,0.06)_62%,transparent_62%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#E9DDFF]">
              {eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.35rem] lg:leading-[1.04]">
              <span className="block">{titleLead}</span>
              {highlightIndex >= 0 ? (
                <span className="block bg-gradient-to-r from-white via-[#E9CFFF] to-[#C9A7FF] bg-clip-text text-transparent">
                  {highlightedText}
                </span>
              ) : null}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">{description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = featureIcons[feature.icon];
                return (
                  <div key={feature.title} className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                    <Icon aria-hidden="true" className="h-7 w-7 shrink-0 text-[#C4A2FF]" />
                    <span>
                      <strong className="block text-sm font-bold leading-5 text-white">{feature.title}</strong>
                      <span className="block text-xs leading-5 text-white/65">{feature.body}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={primary.href}
                className="relative inline-flex min-h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] px-12 py-3 text-center text-sm font-bold text-white shadow-[0_16px_35px_rgba(124,58,237,0.34)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                {primary.label}
                <ArrowRight aria-hidden="true" className="absolute right-5 h-5 w-5" />
              </Link>
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-[#B794F6] bg-white/5 px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  {secondary.label}
                </Link>
              ) : null}
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-white/65">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {footnote}
            </p>
          </div>

          <div className="relative min-h-[24rem] sm:min-h-[30rem]">
            <Image
              src={artworkSrc}
              alt={artworkAlt}
              fill
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
