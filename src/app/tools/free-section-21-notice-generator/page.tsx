import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import FreeSection21ToolPageClient from './PageClient';

export const metadata: Metadata = {
  title: 'Free Section 21 Notice Generator | Form 6A (England)',
  description:
    'Generate a free Section 21 notice preview for England. Validate key inputs and prepare a compliant Form 6A workflow.',
  alternates: {
    canonical: getCanonicalUrl('/tools/free-section-21-notice-generator'),
  },
  openGraph: {
    title: 'Free Section 21 Notice Generator | Form 6A (England)',
    description:
      'Generate a free Section 21 notice preview and review key compliance details before finalising.',
    type: 'website',
    url: getCanonicalUrl('/tools/free-section-21-notice-generator'),
  },
};

export default function FreeSection21NoticeGeneratorPage() {
  return <FreeSection21ToolPageClient />;
}
