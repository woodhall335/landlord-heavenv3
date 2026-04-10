'use client';

import { BlogInlineProductCard } from './BlogInlineProductCard';
import { useBlogCtaContext } from './BlogCtaContext';

interface BlogCTAProps {
  variant?: 'default' | 'urgency' | 'inline';
  title?: string;
  description?: string;
}

const VARIANT_LABELS: Record<NonNullable<BlogCTAProps['variant']>, string> = {
  default: 'Next step for landlords',
  urgency: 'Need to move now?',
  inline: 'What to do next',
};

/**
 * Legacy in-body CTA used by older blog content blocks.
 *
 * This now resolves to the active, context-aware product CTA config so old
 * blog content keeps working with the same intent mapping as sticky/inline slots.
 */
export function BlogCTA({ variant = 'default', title, description }: BlogCTAProps) {
  const context = useBlogCtaContext();

  if (!context) return null;

  return (
    <section className="my-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#692ed4]">
        {title ?? VARIANT_LABELS[variant]}
      </p>
      {description ? (
        <p className="mb-3 text-sm text-slate-600">{description}</p>
      ) : null}
      <BlogInlineProductCard
        cta={context.cta}
        postSlug={context.postSlug}
        category={context.category}
      />
    </section>
  );
}
