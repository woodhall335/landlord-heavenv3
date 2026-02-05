'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiCheckLine, RiShieldCheckFill } from 'react-icons/ri';

const FEATURES = [
  'Download instant UK notices & forms',
  'Covers Section 21, Section 8',
  'England, Wales & Scotland',
];

const MIN_COUNTER = 200;
const MAX_COUNTER = 500;
const DEFAULT_COUNTER = 228;

function getTodaysTarget(date = new Date()) {
  const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes();
  return Math.max(MIN_COUNTER, Math.min(MAX_COUNTER, 200 + Math.floor(minutesSinceMidnight / 4)));
}

export function Hero() {
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
      className="relative isolate overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16"
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
        <div className="grid items-center gap-10 min-[900px]:grid-cols-[1.08fr_0.92fr]">
          <div className="text-[#1F1B2E]">
            <p className="inline-flex flex-wrap items-center gap-3 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm">
              <RiShieldCheckFill className="h-5 w-5 text-[#7c3aed]" aria-hidden="true" />
              <span>Trusted by UK Landlords</span>
              <span className="text-[#facc15]" aria-hidden="true">
                ★★★★★
              </span>
              <span className="font-medium text-[#2b253d]">Rated 4.8 / 5.0 from 247 reviews</span>
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Legal Documents
              <span className="block text-[#7c3aed]">in Minutes, Not Days</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#2b253d] sm:text-xl lg:text-[1.95rem] lg:leading-[1.35]">
              Generate compliant eviction notices, court forms,
              <br className="hidden lg:block" /> and tenancy agreements —
              <span className="font-semibold"> save 80%+ vs solicitor</span>
            </p>

            <div className="mt-6 flex justify-end min-[900px]:hidden" aria-hidden="true">
              <Image
                src="/images/mascots/landlord-heaven-owl-tenancy-tools.png"
                alt=""
                width={320}
                height={320}
                priority
                sizes="(max-width: 640px) 56vw, 320px"
                className="h-auto w-full max-w-[280px]"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2"
              >
                Generate Your Documents →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#7c3aed] bg-white/85 px-6 py-[10px] text-base font-semibold text-[#7c3aed] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2"
              >
                View Pricing →
              </Link>
            </div>

            <ul className="mt-7 grid max-w-2xl gap-3 text-base font-medium sm:grid-cols-2 sm:text-lg">
              {FEATURES.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2">
                  <RiCheckLine className="h-5 w-5 flex-none text-[#7c3aed]" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
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

          <div className="hidden justify-center min-[900px]:flex min-[900px]:justify-end">
            <Image
              src="/images/mascots/landlord-heaven-owl-tenancy-tools.png"
              alt="Landlord Heaven owl mascot holding a pen and shield"
              width={620}
              height={620}
              priority
              sizes="(max-width: 899px) 85vw, (max-width: 1280px) 44vw, 620px"
              className="h-auto w-full max-w-[500px] min-[900px]:max-w-[620px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
