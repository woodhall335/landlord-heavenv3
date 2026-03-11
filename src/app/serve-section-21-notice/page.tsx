import type { Metadata } from 'next';
import { EvictionIntentLandingPage } from '@/components/seo/EvictionIntentLandingPage';
import { INTENT_PAGES, getIntentPageMetadata } from '@/lib/seo/eviction-intent-pages';

const config = INTENT_PAGES['serve-section-21-notice'];

export const metadata: Metadata = getIntentPageMetadata(config);

export default function Page() {
  return <EvictionIntentLandingPage config={config} />;
}
