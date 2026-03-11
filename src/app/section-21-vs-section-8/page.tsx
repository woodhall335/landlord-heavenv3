import type { Metadata } from 'next';
import { EvictionIntentLandingPage } from '@/components/seo/EvictionIntentLandingPage';
import { INTENT_PAGES, getIntentPageMetadata } from '@/lib/seo/eviction-intent-pages';

const config = INTENT_PAGES['section-21-vs-section-8'];

export const metadata: Metadata = getIntentPageMetadata(config);

export default function Page() {
  return <EvictionIntentLandingPage config={config} />;
}
