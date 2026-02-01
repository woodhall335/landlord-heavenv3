import type { Metadata } from 'next';
import { WizardLandingPage } from '@/components/seo/WizardLandingPage';
import { noticeOnlyContent } from '@/lib/seo/wizard-landing-content';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/eviction-notice');

export const metadata: Metadata = {
  title: noticeOnlyContent.title,
  description: noticeOnlyContent.description,
  keywords: [
    'eviction notice',
    'section 21 notice',
    'section 8 notice',
    'notice to leave scotland',
    'section 173 wales',
    'legally validated',
    'procedurally correct',
    'eviction notice generator',
    'landlord eviction',
    'england eviction',
    'wales eviction',
    'scotland eviction',
  ],
  openGraph: {
    title: noticeOnlyContent.title,
    description: noticeOnlyContent.description,
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: noticeOnlyContent.title,
    description: noticeOnlyContent.description,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EvictionNoticePage() {
  return <WizardLandingPage content={noticeOnlyContent} structuredDataUrl={canonicalUrl} />;
}
