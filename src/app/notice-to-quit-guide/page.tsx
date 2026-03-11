import type { Metadata } from 'next';
import { HighIntentPageShell } from '@/components/seo/HighIntentPageShell';
import { PASS2_LONGFORM_PAGES, getPass2Metadata } from '@/lib/seo/pass2-longform-content';

const content = PASS2_LONGFORM_PAGES['notice-to-quit-guide'];

export const metadata: Metadata = getPass2Metadata(content);

export default function Page() {
  return <HighIntentPageShell {...content} />;
}
