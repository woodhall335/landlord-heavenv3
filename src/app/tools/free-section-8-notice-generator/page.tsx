import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import FreeSection8ToolPageClient from './PageClient';

export const metadata: Metadata = {
  title: 'Free Section 8 Notice Generator | Form 3 (England)',
  description:
    'Generate a free Section 8 notice preview for England. Build a structured Form 3 draft with guided grounds and timing checks.',
  alternates: {
    canonical: getCanonicalUrl('/tools/free-section-8-notice-generator'),
  },
  openGraph: {
    title: 'Free Section 8 Notice Generator | Form 3 (England)',
    description:
      'Generate a free Section 8 notice preview and review grounds-based details before finalising.',
    type: 'website',
    url: getCanonicalUrl('/tools/free-section-8-notice-generator'),
  },
};

export default function FreeSection8NoticeGeneratorPage() {
  return <FreeSection8ToolPageClient />;
}
