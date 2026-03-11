import type { Metadata } from 'next';
import { HighIntentPageShell } from '@/components/seo/HighIntentPageShell';
import { INTENT_PAGES, getIntentPageMetadata } from '@/lib/seo/eviction-intent-pages';
import { PASS1_LONGFORM_PAGES } from '@/lib/seo/pass1-longform-content';

const config = INTENT_PAGES['section-8-grounds-explained'];
const content = PASS1_LONGFORM_PAGES['section-8-grounds-explained'];

export const metadata: Metadata = getIntentPageMetadata(config);

export default function Section8GroundsExplainedPage() {
  return <HighIntentPageShell {...content} />;
}
