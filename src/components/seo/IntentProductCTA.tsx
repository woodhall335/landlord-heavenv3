import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
      description: 'Generate court-ready eviction notices with procedural checks.',
      href: PRODUCT_FALLBACK_HREF.notice_only,
    },
    money_claim: {
      title: 'Money Claim',
      description: 'Recover rent arrears and tenant debt with guided court forms.',
      href: PRODUCT_FALLBACK_HREF.money_claim,
    },
    complete_pack: {
      title: 'Complete Pack',
      description: 'End-to-end eviction bundle with notice and possession claim documents.',
      href: PRODUCT_FALLBACK_HREF.complete_pack,
    },
    ast: {
      title: 'AST Tenancy Agreement',
      description: 'Build compliant tenancy agreements for England, Wales, Scotland, and Northern Ireland.',
      href: PRODUCT_FALLBACK_HREF.ast,
    },
  };

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Related products</h2>
          <p className="text-gray-600 mb-8">Compare related landlord document workflows.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={product}
                href={productMeta[product].href}
                className="rounded-xl border border-gray-200 p-5 hover:border-primary/50 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{productMeta[product].title}</h3>
                <p className="text-sm text-gray-600 mb-3">{productMeta[product].description}</p>
                <span className="text-primary font-medium text-sm">View product -&gt;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
