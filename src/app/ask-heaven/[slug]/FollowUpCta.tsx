'use client';

import React from 'react';
import Link from 'next/link';
import { trackAskHeavenFollowupToWizard } from '@/lib/analytics';

interface FollowUpCtaProps {
  slug: string;
  question: string;
  className?: string;
}

export function FollowUpCta({ slug, question, className }: FollowUpCtaProps) {
  const href = `/ask-heaven?q=${encodeURIComponent(question)}`;

  return (
    <Link
      href={href}
      onClick={() => trackAskHeavenFollowupToWizard({ slug, destination: href })}
      className={
        className ??
        'inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors'
      }
    >
      Ask a follow-up in Ask Heaven
    </Link>
  );
}
