import type { Metadata } from 'next';
import { HighIntentPageShell } from '@/components/seo/HighIntentPageShell';
import { PHASE5_PAGES, getPhase5Metadata } from '@/lib/seo/phase5-pages';

const content = PHASE5_PAGES['can-a-landlord-evict-for-noise-complaints'];

export const metadata: Metadata = getPhase5Metadata(content);

export default function Page() {
  return <HighIntentPageShell {...content} />;
}
