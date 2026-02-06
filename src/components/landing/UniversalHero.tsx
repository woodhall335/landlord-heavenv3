'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiCheckLine, RiShieldCheckFill } from 'react-icons/ri';

type HeroCta = {
  label: string;
  href: string;
};

export type UniversalHeroProps = {
  trustText: string;
  title: string;
  highlightTitle: string;
  subtitle: ReactNode;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  feature: string;
  mascotSrc: string;
  mascotAlt: string;
};

const MIN_COUNTER = 200;
const MAX_COUNTER = 500;
const DEFAULT_COUNTER = 228;

function getTodaysTarget(date = new Date()) {
  const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes();
  return Math.max(MIN_COUNTER, Math.min(MAX_COUNTER, 200 + Math.floor(minutesSinceMidnight / 4)));
}

export function UniversalHero({
  trustText,
  title,
  highlightTitle,
  subtitle,
  primaryCta,
  secondaryCta,
  feature,
  mascotSrc,
  mascotAlt,
}: UniversalHeroProps) {
  // LOCKED v1: Do not modify this component's layout/visual structure/behavior directly.
  // For page-specific hero text, mascot, and CTA customization, pass values via props only.
  const mobileTitleParts = title.split('Legal Documents');
  const hasLegalDocumentsInTitle = mobileTitleParts.length > 1;
  const shouldForceMobileHighlightBreak = highlightTitle === 'in Minutes, Not Days';
  const mobileHighlightParts = shouldForceMobileHighlightBreak ? highlightTitle.split(', ') : [];
  const [usedTodayCount, setUsedTodayCount] = useState(DEFAULT_COUNTER);
  const animationFrameRef = useRef<number | null>(null);
  const currentCountRef = useRef(DEFAULT_COUNTER);

  useEffect(() => {
    currentCountRef.current = usedTodayCount;
  }, [usedTodayCount]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateToTarget = (target: number) => {
      if (prefersReducedMotion) {
        setUsedTodayCount(target);
        return;
      }

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      const duration = 1200;
      const startValue = Math.max(MIN_COUNTER, Math.min(target, currentCountRef.current));
      const startedAt = performance.now();

      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        const nextValue = Math.round(startValue + (target - startValue) * progress);
        setUsedTodayCount(nextValue);

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(step);
        }
      };

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    animateToTarget(getTodaysTarget());

    const intervalId = window.setInterval(() => {
      animateToTarget(getTodaysTarget());
    }, 60_000);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      className="relative isolate overflow-hidden pt-12 pb-10 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-14"
      aria-label="Landlord Heaven legal document hero"
    >
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <Image
          src="/images/herobg.png"
          alt="Purple sky background with clouds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/20 to-white/30"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative min-[900px]:grid min-[900px]:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)] min-[900px]:items-center min-[900px]:gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="pointer-events-none absolute -right-6 top-[37.5%] z-0 w-[203px] -translate-y-[80%] min-[420px]:w-[224px] min-[900px]:hidden sm:-translate-y-1/2" aria-hidden="true">
            <Image
              src={mascotSrc}
              alt=""
              width={620}
              height={620}
              priority
              sizes="(max-width: 420px) 203px, (max-width: 899px) 224px"
              className="h-auto w-full"
            />
          </div>

          <div className="relative z-10 w-full min-w-0 text-[#1F1B2E]">
            <p className="hidden w-full max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-center text-sm font-semibold shadow-sm backdrop-blur-sm sm:flex sm:w-auto sm:justify-start sm:text-left">
              <RiShieldCheckFill className="h-5 w-5 text-[#7c3aed]" aria-hidden="true" />
              <span>{trustText}</span>
              <span className="text-[#facc15]" aria-hidden="true">
                ★★★★★
              </span>
              <span className="font-medium text-[#2b253d]">Rated 4.8 / 5.0 from 247 reviews</span>
            </p>

            <h1 className="mt-5 max-w-[18ch] pr-24 text-[2.125rem] font-bold leading-[1.1] tracking-tight min-[420px]:pr-28 min-[900px]:pr-0 sm:text-5xl lg:text-6xl">
              <span className="sm:hidden">
                {hasLegalDocumentsInTitle ? (
                  <>
                    {mobileTitleParts[0]}
                    <span className="whitespace-nowrap">Legal Documents</span>
                    {mobileTitleParts.slice(1).join('Legal Documents')}
                  </>
                ) : (
                  title
                )}
              </span>
              <span className="hidden sm:inline">{title}</span>
              <span className="block text-[#7c3aed]">
                <span className="sm:hidden">
                  {shouldForceMobileHighlightBreak && mobileHighlightParts.length === 2 ? (
                    <>
                      {mobileHighlightParts[0]},
                      <br />
                      {mobileHighlightParts[1]}
                    </>
                  ) : (
                    highlightTitle
                  )}
                </span>
                <span className="hidden sm:inline">{highlightTitle}</span>
              </span>
            </h1>

            <p className="mt-4 w-full rounded-xl bg-white/75 px-4 py-3 pr-24 text-lg leading-relaxed text-[#2b253d] backdrop-blur-[2px] min-[420px]:pr-28 min-[900px]:pr-0 sm:max-w-[52ch] sm:rounded-none sm:bg-transparent sm:p-0 sm:pr-0 sm:text-xl sm:backdrop-blur-0">{subtitle}</p>

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-auto">
                <Link href={primaryCta.href} className="hero-btn-primary flex w-full justify-center text-center sm:w-auto">
                  {primaryCta.label}
                </Link>
              </div>
              <div className="w-full sm:w-auto">
                <Link href={secondaryCta.href} className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto">
                  {secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2 text-base font-medium text-[#2b253d] sm:text-lg">
              <RiCheckLine className="mt-0.5 h-5 w-5 flex-none text-[#7c3aed]" aria-hidden="true" />
              <span>{feature}</span>
            </div>

            <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>
                <strong className="font-semibold tabular-nums">{usedTodayCount}</strong> landlords used this today
              </span>
            </div>
          </div>

          <div className="relative z-0 hidden justify-center -ml-10 sm:-ml-2 sm:justify-end lg:ml-0 lg:justify-end min-[900px]:flex">
            <Image
              src={mascotSrc}
              alt={mascotAlt}
              width={620}
              height={620}
              priority
              sizes="(max-width: 640px) 320px, (max-width: 1024px) 320px, (max-width: 1280px) 38vw, 620px"
              className="h-auto w-full max-w-[320px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[500px] xl:max-w-[560px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
