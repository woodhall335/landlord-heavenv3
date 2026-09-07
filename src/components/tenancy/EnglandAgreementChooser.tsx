'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, Users } from 'lucide-react';

import { CommercialSeoTrackedCta } from '@/components/seo/CommercialSeoTrackedCta';
import { PRODUCTS } from '@/lib/pricing/products';

type LetType = 'ordinary' | 'student' | 'shared' | 'lodger';

const LET_OPTIONS: Array<{ key: LetType; label: string; description: string }> = [
  { key: 'ordinary', label: 'Ordinary whole-property let', description: 'One household rents the whole property.' },
  { key: 'student', label: 'Student household', description: 'Students rent together and guarantor wording may be needed.' },
  { key: 'shared', label: 'HMO or shared house', description: 'Occupiers share rooms or communal facilities.' },
  { key: 'lodger', label: 'I live there with a lodger', description: 'The landlord shares their home with the occupier.' },
];

const RECOMMENDATIONS = {
  student: {
    title: 'Student Tenancy Agreement',
    body: 'Built for student occupiers, shared responsibilities, guarantors and end-of-term handover.',
    href: '/student-tenancy-agreement',
    price: PRODUCTS.england_student_tenancy_agreement.displayPrice,
  },
  shared: {
    title: 'HMO / Shared House Tenancy Agreement',
    body: 'Built for shared occupation, communal areas, house rules and occupier responsibilities.',
    href: '/hmo-shared-house-tenancy-agreement',
    price: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
  },
  lodger: {
    title: 'Lodger Agreement',
    body: 'Built for resident landlords sharing their home with an occupier.',
    href: '/lodger-agreement',
    price: PRODUCTS.england_lodger_agreement.displayPrice,
  },
} as const;

export function EnglandAgreementChooser() {
  const [isEngland, setIsEngland] = useState<boolean | null>(null);
  const [letType, setLetType] = useState<LetType | null>(null);

  const specialist = letType && letType !== 'ordinary' ? RECOMMENDATIONS[letType] : null;

  return (
    <section aria-labelledby="agreement-chooser-title" className="rounded-3xl border border-[#D8C8FF] bg-white p-5 shadow-[0_18px_46px_rgba(24,11,49,0.08)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D28D9]">60-second agreement chooser</p>
      <h2 id="agreement-chooser-title" className="mt-2 text-2xl font-bold text-[#17142B] sm:text-3xl">
        Find the agreement that matches the property
      </h2>
      <div className="mt-6">
        <p className="flex items-center gap-2 font-semibold text-[#17142B]"><MapPin className="h-5 w-5 text-[#6D28D9]" /> Is the rental property in England?</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" onClick={() => { setIsEngland(true); setLetType(null); }} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isEngland === true ? 'border-[#6D28D9] bg-[#F4F0FF] text-[#4C1D95]' : 'border-gray-300 bg-white text-gray-800'}`}>Yes, England</button>
          <button type="button" onClick={() => { setIsEngland(false); setLetType(null); }} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isEngland === false ? 'border-[#6D28D9] bg-[#F4F0FF] text-[#4C1D95]' : 'border-gray-300 bg-white text-gray-800'}`}>No, another UK nation</button>
        </div>
      </div>

      {isEngland === false ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-950">Use the jurisdiction selector</h3>
          <p className="mt-2 text-sm leading-6 text-amber-900">Wales, Scotland and Northern Ireland use different agreement types. Choose the property nation before starting.</p>
          <CommercialSeoTrackedCta href="/standard-tenancy-agreement" label="Choose my UK jurisdiction" variant="primary" sourcePage="/products/ast" pageType="product_page" intent="tenancy_agreement" ctaPosition="selector" recommendedProduct="tenancy_agreement" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#17142B] px-5 py-3 text-sm font-semibold text-white">
            Choose my jurisdiction <ArrowRight className="h-4 w-4" />
          </CommercialSeoTrackedCta>
        </div>
      ) : null}

      {isEngland === true ? (
        <div className="mt-7">
          <p className="flex items-center gap-2 font-semibold text-[#17142B]"><Users className="h-5 w-5 text-[#6D28D9]" /> How will the property be occupied?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {LET_OPTIONS.map((option) => (
              <button key={option.key} type="button" onClick={() => setLetType(option.key)} className={`rounded-2xl border p-4 text-left transition ${letType === option.key ? 'border-[#6D28D9] bg-[#F4F0FF]' : 'border-gray-200 bg-white hover:border-[#BDA5F7]'}`}>
                <span className="font-semibold text-[#17142B]">{option.label}</span>
                <span className="mt-1 block text-sm leading-6 text-gray-600">{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isEngland === true && letType === 'ordinary' ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Recommendation title="Standard Tenancy Agreement" body="For a straightforward whole-property let with the essential agreement and setup records." href="/standard-tenancy-agreement" price={PRODUCTS.england_standard_tenancy_agreement.displayPrice} label="Choose Standard" />
          <Recommendation title="Premium Tenancy Agreement" body="For landlords who want fuller wording around access, repairs, keys, inspections and hand-back." href="/premium-tenancy-agreement" price={PRODUCTS.england_premium_tenancy_agreement.displayPrice} label="Choose Premium" />
        </div>
      ) : null}

      {specialist ? (
        <div className="mt-6">
          <Recommendation {...specialist} label={`Choose ${specialist.title}`} />
        </div>
      ) : null}
    </section>
  );
}

function Recommendation({ title, body, href, price, label }: { title: string; body: string; href: string; price: string; label: string }) {
  return (
    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Recommended route</p>
      <h3 className="mt-2 text-xl font-bold text-[#17142B]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-700">{body}</p>
      <p className="mt-3 font-bold text-[#17142B]">{price}</p>
      <CommercialSeoTrackedCta href={href} label={label} variant="primary" sourcePage="/products/ast" pageType="product_page" intent="tenancy_agreement" ctaPosition="selector" recommendedProduct="tenancy_agreement" price={price} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#17142B] px-5 py-3 text-sm font-semibold text-white">
        {label} <ArrowRight className="h-4 w-4" />
      </CommercialSeoTrackedCta>
    </article>
  );
}
