import type { Metadata } from 'next';
import { WizardLandingPage } from '@/components/seo/WizardLandingPage';
import { completePackContent } from '@/lib/seo/wizard-landing-content';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/eviction-pack-england');

export const metadata: Metadata = {
  title: completePackContent.title,
  description: completePackContent.description,
  keywords: [
    'complete eviction pack',
    'eviction bundle england',
    'section 21',
    'section 8',
    'N5 form',
    'N5B form',
    'N119 form',
    'accelerated possession',
    'court forms landlord',
    'england only',
    'HMCTS forms',
    'possession claim',
  ],
  openGraph: {
    title: completePackContent.title,
    description: completePackContent.description,
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: completePackContent.title,
    description: completePackContent.description,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EvictionPackEnglandPage() {
  return <WizardLandingPage content={completePackContent} structuredDataUrl={canonicalUrl} />;
}
