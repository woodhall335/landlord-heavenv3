import type { Metadata } from 'next';
import { PillarPageShell } from '@/components/seo/PillarPageShell';
import { PILLAR_PAGES, getPillarMetadata } from '@/lib/seo/pillar-pages-content';

const content = PILLAR_PAGES['section-8-notice-guide'];

export const metadata: Metadata = getPillarMetadata(content);

export default function Page() {
  return <PillarPageShell {...content} />;
}
