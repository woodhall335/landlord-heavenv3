import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StaggerReveal } from '@/components/marketing/PremiumMotion';

export type IntentProduct = 'notice_only' | 'money_claim' | 'complete_pack' | 'ast';
export type IntentSource = string;
export type IntentTopic = string;

interface IntentProductCTAProps {
  intent: {
    product: IntentProduct;
    src: IntentSource;
    topic?: IntentTopic;
  };
  label: string;
  className?: string;
  showArrow?: boolean;
}

const PRODUCT_FALLBACK_HREF: Record<IntentProduct, string> = {
  notice_only: '/products/notice-only',
  money_claim: '/products/money-claim',
  complete_pack: '/products/complete-pack',
  ast: '/products/ast',
};

export function getIntentProductHref(intent: {
  product: IntentProduct;
  src: IntentSource;
  topic?: IntentTopic;
}): string {
  return PRODUCT_FALLBACK_HREF[intent.product];
}

export function IntentProductCTA({
  intent,
  label,
  className,
  showArrow = true,
}: IntentProductCTAProps) {
  return (
    <Link href={getIntentProductHref(intent)} className={className}>
      {label}
      {showArrow && <ArrowRight className="w-5 h-5 inline ml-1" />}
    </Link>
  );
}

interface RelatedProductsModuleProps {
  products: IntentProduct[];
}

export function RelatedProductsModule({ products }: RelatedProductsModuleProps) {
  const productMeta: Record<IntentProduct, { title: string; description: string; href: string }> = {
    notice_only: {
      title: 'Notice Only',
      description: 'Prepare a Section 8 notice and service record before you serve.',
      href: PRODUCT_FALLBACK_HREF.notice_only,
    },
    money_claim: {
      title: 'Money Claim',
      description: 'Set out unpaid rent or tenant debt with clearer claim paperwork.',
      href: PRODUCT_FALLBACK_HREF.money_claim,
    },
    complete_pack: {
      title: 'Court Possession Pack',
      description: 'Prepare the notice file, claim forms, witness evidence, and filing steps together.',
      href: PRODUCT_FALLBACK_HREF.complete_pack,
    },
    ast: {
      title: 'Tenancy Agreement',
      description: 'Choose an agreement that fits the property, occupiers, and let type.',
      href: PRODUCT_FALLBACK_HREF.ast,
    },
  };

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Related products</h2>
          <p className="text-gray-600 mb-8">Compare the landlord paperwork that fits your situation.</p>
          <StaggerReveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product}
                href={productMeta[product].href}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/50 public-surface-card standalone-premium-hover-lift"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{productMeta[product].title}</h3>
                <p className="text-sm text-gray-600 mb-3">{productMeta[product].description}</p>
                <span className="text-primary font-medium text-sm">See this option -&gt;</span>
              </Link>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
