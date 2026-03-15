import {
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS,
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_WIZARD_UPSELLS,
  type ResidentialLettingProductSku,
  getResidentialLandingHref,
  getResidentialWizardHref,
} from '@/lib/residential-letting/products';
import {
  getResidentialStandaloneProfile,
  type ResidentialCautionBanner,
} from '@/lib/residential-letting/standalone-profiles';

type PublicResidentialLettingProductSku =
  (typeof PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS)[number];

export interface ResidentialLandingContent {
  slug: string;
  product: PublicResidentialLettingProductSku;
  title: string;
  description: string;
  h1: string;
  subheading: string;
  overview: string;
  icon: string;
  whyUseThis: string[];
  howWizardWorks: string[];
  whoThisIsFor: string[];
  notFor: string[];
  legalExplainer: string;
  includedHighlights: string[];
  documentPreviewAnatomy: string[];
  internalLinks: Array<{ label: string; href: string; description: string }>;
  cautionBanner?: ResidentialCautionBanner;
  faqs: Array<{ question: string; answer: string }>;
}

export const RESIDENTIAL_LANDING_CONTENT: Record<
  PublicResidentialLettingProductSku,
  ResidentialLandingContent
> = Object.fromEntries(
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS.map((product) => {
    const profile = getResidentialStandaloneProfile(product);
    const landing = profile.landing;

    return [
      product,
      {
        slug: RESIDENTIAL_LETTING_PRODUCTS[product].slug,
        product,
        title: landing.title,
        description: landing.description,
        h1: landing.h1,
        subheading: landing.subheading,
        overview: landing.overview,
        icon: profile.icon,
        whyUseThis: landing.whyUseThis,
        howWizardWorks: landing.howWizardWorks,
        whoThisIsFor: landing.whoThisIsFor,
        notFor: landing.notFor,
        legalExplainer: landing.legalExplainer,
        includedHighlights: landing.includedHighlights,
        documentPreviewAnatomy: landing.documentPreviewAnatomy,
        internalLinks: landing.internalLinks,
        cautionBanner: profile.cautionBanner,
        faqs: landing.faqs,
      },
    ];
  })
) as Record<PublicResidentialLettingProductSku, ResidentialLandingContent>;

export function getResidentialLandingContentBySlug(slug: string): ResidentialLandingContent | undefined {
  return Object.values(RESIDENTIAL_LANDING_CONTENT).find((content) => content.slug === slug);
}

export function getResidentialLandingSlugs(): string[] {
  return Object.values(RESIDENTIAL_LANDING_CONTENT).map((content) => content.slug);
}

export function getResidentialRelatedLinks(product: ResidentialLettingProductSku): Array<{
  label: string;
  href: string;
  description: string;
}> {
  const wizardUpsells = RESIDENTIAL_WIZARD_UPSELLS[product] || [];
  return wizardUpsells
    .map((sku) => ({
      label: RESIDENTIAL_LETTING_PRODUCTS[sku].label,
      href: getResidentialLandingHref(sku),
      description: RESIDENTIAL_LETTING_PRODUCTS[sku].description,
    }))
    .slice(0, 3);
}

export function getResidentialWizardEntry(product: ResidentialLettingProductSku): string {
  return getResidentialWizardHref(product).replace('src=product_page', 'src=seo_landing');
}
