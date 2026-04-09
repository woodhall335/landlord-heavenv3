import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRentIncreaseGuideMetadata, RentIncreaseGuidePageView } from '../RentIncreaseGuidePage';
import { getRentIncreaseGuidePage, RENT_INCREASE_GUIDE_SLUGS, type RentIncreaseGuideSlug } from '../content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function isRentIncreaseGuideSlug(value: string): value is RentIncreaseGuideSlug {
  return (RENT_INCREASE_GUIDE_SLUGS as readonly string[]).includes(value);
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: RentIncreaseGuideSlug }> {
  return RENT_INCREASE_GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isRentIncreaseGuideSlug(slug)) {
    return {
      title: 'Rent Increase Guide | Landlord Heaven',
      description: 'England rent increase guidance for landlords using the Section 13 process.',
      robots: 'noindex, nofollow',
    };
  }

  const config = getRentIncreaseGuidePage(slug);
  return getRentIncreaseGuideMetadata(config);
}

export default async function RentIncreaseGuideSlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isRentIncreaseGuideSlug(slug)) {
    notFound();
  }

  const config = getRentIncreaseGuidePage(slug);
  return <RentIncreaseGuidePageView config={config} />;
}

