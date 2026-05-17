import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Section 8 Notice Only Sample | Form 3A Pack',
  description:
    'Redirecting to the current Section 8 notice sample pack with Form 3A, N215 certificate of service, arrears schedule, and service checks.',
  alternates: { canonical: getCanonicalUrl('/samples/section-8-notice-example') },
  robots: { index: false, follow: true },
};

export default function Page() {
  redirect('/samples/section-8-notice-example');
}
