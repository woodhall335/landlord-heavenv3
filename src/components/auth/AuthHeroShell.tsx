'use client';

import { ReactNode } from 'react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';

interface AuthHeroShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthHeroShell({ title, subtitle, children }: AuthHeroShellProps) {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <UniversalHero
        title=""
        align="center"
        hideMedia
        showReviewPill={false}
        showUsageCounter={false}
        ariaLabel={`${title} page`}
      >
        <div className="flex min-h-[calc(100vh-10rem)] items-start justify-center pb-8 pt-2 md:items-center md:py-8">
          <div className="w-full max-w-3xl rounded-3xl border border-white/35 bg-white/15 p-4 shadow-[0_30px_80px_rgba(32,12,71,0.35)] backdrop-blur-md sm:p-6 md:p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
              <p className="mt-3 text-lg text-white/90 sm:text-2xl">{subtitle}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-white/55 bg-white/80 p-5 shadow-[0_20px_55px_rgba(48,20,100,0.2)] backdrop-blur-sm sm:p-7">
              {children}
            </div>
          </div>
        </div>
      </UniversalHero>
    </>
  );
}
