'use client';

import React from 'react';
import Link from 'next/link';
import { trackAskHeavenFollowupToWizard } from '@/lib/analytics';
import { Reveal } from '@/components/marketing/PremiumMotion';

interface FollowUpCtaProps {
  slug: string;
  question: string;
  className?: string;
}

export function FollowUpCta({ slug, question, className }: FollowUpCtaProps) {
  const href = `/ask-heaven?q=${encodeURIComponent(question)}`;

  return (
    <Reveal as="span" className="inline-flex">
      <Link
        href={href}
        onClick={() => trackAskHeavenFollowupToWizard({ slug, destination: href })}
        className={
          className ??
          'inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(105,46,212,0.20)] transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-[0_20px_42px_rgba(105,46,212,0.26)]'
        }
      >
        Ask a follow-up in Ask Heaven
      </Link>
    </Reveal>
  );
}
