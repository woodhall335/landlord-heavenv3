import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResidentialProductLandingPage } from '@/components/seo/ResidentialProductLandingPage';
import {
  getResidentialLandingContentBySlug,
  getResidentialLandingSlugs,
} from '@/lib/seo/residential-product-landing-content';
import { getCanonicalUrl } from '@/lib/seo';

interface ResidentialLandingRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getResidentialLandingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ResidentialLandingRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getResidentialLandingContentBySlug(slug);

  if (!content) {
    return {};
  }

  const canonicalUrl = getCanonicalUrl(`/${content.slug}`);

  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: content.title,
      description: content.description,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function ResidentialLandingRoute({
  params,
}: ResidentialLandingRouteProps) {
  const { slug } = await params;
  const content = getResidentialLandingContentBySlug(slug);

  if (!content) {
    notFound();
  }

  const canonicalUrl = getCanonicalUrl(`/${content.slug}`);

  return <ResidentialProductLandingPage content={content} canonicalUrl={canonicalUrl} />;
}
