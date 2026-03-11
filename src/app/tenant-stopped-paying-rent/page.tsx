import { HighIntentPageShell } from '@/components/seo/HighIntentPageShell';
import { PASS1_PAGES, getPass1Metadata } from '@/lib/seo/high-intent-pass1-pages';

const page = PASS1_PAGES['tenant-stopped-paying-rent'];

export const metadata = getPass1Metadata(page);

export default function TenantStoppedPayingRentPage() {
  return <HighIntentPageShell {...page} />;
}
