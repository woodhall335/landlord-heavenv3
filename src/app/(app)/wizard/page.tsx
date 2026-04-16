import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import {
  PUBLIC_PRODUCT_DESCRIPTORS,
  getPublicProductDescriptor,
  getPublicProductOwnerHref,
} from '@/lib/public-products';
import {
  getRetiredPublicSkuRedirectDestination,
  isRetiredPublicSku,
} from '@/lib/public-retirements';
import WizardClientPage from './WizardClientPage';

const BASE_URL = 'https://landlordheaven.co.uk';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const DEFAULT_SEO = {
  title: 'England Landlord Document Wizard',
  description:
    'Start an England landlord workflow for Section 8 notices, court possession, money claims, rent increases, and tenancy agreements.',
  canonicalRoute: '/wizard',
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const product = typeof params.product === 'string' ? params.product : undefined;
  const type = typeof params.type === 'string' ? params.type : undefined;
  const jurisdiction = typeof params.jurisdiction === 'string' ? params.jurisdiction : undefined;

  if (jurisdiction && jurisdiction !== 'england') {
    const canonical = `${BASE_URL}${getPublicProductOwnerHref(product, type)}`;

    return {
      title: 'England Landlord Products | Landlord Heaven',
      description:
        'Public Landlord Heaven products now start in England only. Historic non-England cases remain available through direct account access.',
      alternates: {
        canonical,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const descriptor =
    getPublicProductDescriptor(product) ??
    (product === 'tenancy_agreement' ? PUBLIC_PRODUCT_DESCRIPTORS.ast : null);

  const title = descriptor ? `${descriptor.seoTitle} | Landlord Heaven` : `${DEFAULT_SEO.title} | Landlord Heaven`;
  const description = descriptor?.metaDescription ?? DEFAULT_SEO.description;
  const canonical = `${BASE_URL}${descriptor?.landingHref ?? DEFAULT_SEO.canonicalRoute}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Landlord Heaven',
      url: canonical,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default async function WizardPage({ searchParams }: Props) {
  const params = await searchParams;
  const product = typeof params.product === 'string' ? params.product : undefined;

  if (product && isRetiredPublicSku(product)) {
    redirect(getRetiredPublicSkuRedirectDestination(product) ?? '/products/ast');
  }

  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <WizardClientPage />
    </>
  );
}
