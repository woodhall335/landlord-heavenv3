import type { Metadata } from 'next';
import { EvictionIntentLandingPage } from '@/components/seo/EvictionIntentLandingPage';
import { INTENT_PAGES, getIntentPageMetadata } from '@/lib/seo/eviction-intent-pages';

const config = INTENT_PAGES['complete-eviction-pack-england'];

export const metadata: Metadata = getIntentPageMetadata(config);

export default function Page() {
  return <EvictionIntentLandingPage config={config} />;
}
