'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { RiQuestionAnswerLine, RiArrowRightLine } from 'react-icons/ri';
import {
  buildAskHeavenLink,
  type AskHeavenSource,
  type AskHeavenTopic,
} from '@/lib/ask-heaven/buildAskHeavenLink';

export type AskHeavenWidgetVariant = 'card' | 'banner' | 'compact' | 'inline';

export interface AskHeavenWidgetProps {
  variant?: AskHeavenWidgetVariant;
  source?: AskHeavenSource;
  topic?: AskHeavenTopic;
  product?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  className?: string;
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

const DEFAULT_CONTENT = {
  title: 'Have a landlord question?',
  description: 'Ask Heaven is our free AI assistant that can help with eviction advice, tenancy questions, and more.',
  ctaText: 'Ask Heaven Free →',
};

/**
 * Reusable Ask Heaven widget with multiple display variants
 *
 * @example Card variant (for sidebars, product pages)
 * <AskHeavenWidget variant="card" source="product_page" topic="eviction" />
 *
 * @example Banner variant (full-width promotional)
 * <AskHeavenWidget variant="banner" source="blog" />
 *
 * @example Compact variant (small inline mentions)
 * <AskHeavenWidget variant="compact" source="validator" topic="epc" />
 *
 * @example Inline variant (text link style)
 * <AskHeavenWidget variant="inline" />
 */
export function AskHeavenWidget({
  variant = 'card',
  source = 'widget',
  topic,
  product,
  title = DEFAULT_CONTENT.title,
  description = DEFAULT_CONTENT.description,
  ctaText = DEFAULT_CONTENT.ctaText,
  className,
  jurisdiction,
  utm_source,
  utm_medium,
  utm_campaign,
}: AskHeavenWidgetProps) {
  const href = buildAskHeavenLink({
    source,
    topic,
    product,
    jurisdiction,
    utm_source,
    utm_medium,
    utm_campaign,
  });

  if (variant === 'inline') {
    return (
      <Link
        href={href}
        className={clsx(
          'inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium transition-colors',
          className
        )}
      >
        <RiQuestionAnswerLine className="h-4 w-4" />
        <span>{ctaText}</span>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={clsx(
          'group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary/30 hover:shadow-md',
          className
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Image
            src="/favicon.png"
            alt="Ask Heaven"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600">Free AI landlord assistant</p>
        </div>
        <RiArrowRightLine className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </Link>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={clsx(
          'relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-8 text-white shadow-lg sm:px-10',
          className
        )}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Image
                src="/favicon.png"
                alt="Ask Heaven"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-1 text-white/90">{description}</p>
            </div>
          </div>
          <Link
            href={href}
            className="shrink-0 rounded-lg bg-white px-6 py-3 font-semibold text-primary shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Image
            src="/favicon.png"
            alt="Ask Heaven"
            width={28}
            height={28}
            className="h-7 w-7"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
      <Link
        href={href}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        <RiQuestionAnswerLine className="h-5 w-5" />
        <span>{ctaText}</span>
      </Link>
    </div>
  );
}

export default AskHeavenWidget;
