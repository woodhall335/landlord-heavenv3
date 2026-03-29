'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  ENGLAND_TENANCY_PRODUCT_IMAGES,
  ENGLAND_TENANCY_PRODUCT_ORDER,
  type EnglandModernTenancyProductSku,
} from '@/lib/tenancy/england-product-model';

interface EnglandTenancyProductChooserProps {
  onSelect: (product: EnglandModernTenancyProductSku) => void;
}

const PRODUCT_CARD_COPY: Record<
  EnglandModernTenancyProductSku,
  { summary: string; bullet: string }
> = {
  england_standard_tenancy_agreement: {
    summary:
      'For a straightforward whole-property residential let in England.',
    bullet: 'Baseline England residential agreement for an ordinary let.',
  },
  england_premium_tenancy_agreement: {
    summary:
      'For an ordinary England residential let where you want fuller drafting and more operational detail.',
    bullet: 'Premium residential drafting without turning Premium into HMO by default.',
  },
  england_student_tenancy_agreement: {
    summary:
      'For student-focused lets with guarantor, sharer, and end-of-term expectations.',
    bullet: 'Student-specific wording and workflow support.',
  },
  england_hmo_shared_house_tenancy_agreement: {
    summary:
      'For shared houses and HMO-style occupation with communal-area and sharer detail.',
    bullet: 'Separate HMO/shared-house product, not a Premium shortcut.',
  },
  england_lodger_agreement: {
    summary:
      'For a resident landlord letting a room in the home on a lodger/licence basis.',
    bullet: 'Separate resident-landlord route, not an AST/HMO variant.',
  },
};

export function EnglandTenancyProductChooser({
  onSelect,
}: EnglandTenancyProductChooserProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            England Tenancy Products
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            Choose the England agreement that fits the occupation setup
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Standard and Premium stay available, and Student, HMO / Shared, and Lodger each now
            have their own product route instead of being bundled into Premium.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {ENGLAND_TENANCY_PRODUCT_ORDER.map((product) => {
            const config = PRODUCTS[product];
            const copy = PRODUCT_CARD_COPY[product];
            const image = ENGLAND_TENANCY_PRODUCT_IMAGES[product];

            return (
              <Card
                key={product}
                padding="none"
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 shadow-sm"
              >
                <div className="relative aspect-[16/9] border-b border-gray-200 bg-gray-100">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1280px) 360px, (min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{config.label}</h2>
                      <p className="mt-2 text-sm text-gray-600">{copy.summary}</p>
                    </div>
                    <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900">
                      {config.displayPrice}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                    {copy.bullet}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">{config.description}</p>

                  <div className="mt-auto pt-6">
                    <Button onClick={() => onSelect(product)} fullWidth>
                      Start {config.shortLabel}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
