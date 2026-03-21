import Link from 'next/link';
import {
  getAnchorText,
  getFreshnessPolicy,
  getPrimaryProductForScenario,
  getSeoPageTaxonomy,
  type SeoScenario,
} from '@/lib/seo/page-taxonomy';

interface SeoPageContextPanelProps {
  pathname: string;
  scenario?: SeoScenario;
  className?: string;
}

export function SeoPageContextPanel({
  pathname,
  scenario = 'default',
  className = '',
}: SeoPageContextPanelProps) {
  const entry = getSeoPageTaxonomy(pathname);

  if (!entry) {
    return null;
  }

  const freshness = getFreshnessPolicy(entry);
  const productHref = getPrimaryProductForScenario(entry, scenario);
  const pillarAnchor = getAnchorText(entry, 'pillar');
  const supportingAnchor = getAnchorText(entry, 'supporting');
  const productAnchor = getAnchorText(entry, 'product');

  return (
    <div
      className={`rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8 ${className}`}
      data-testid="seo-page-context"
    >
      {freshness ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Reviewed</p>
            <p className="mt-2 text-sm text-gray-700">{freshness.reviewedDate}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Scope</p>
            <p className="mt-2 text-sm text-gray-700">{freshness.jurisdictionScope}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal Context</p>
            <p className="mt-2 text-sm text-gray-700">{freshness.legalContextNote}</p>
          </div>
        </div>
      ) : null}

      <div className={freshness ? 'mt-6 space-y-4 text-gray-700 leading-7' : 'space-y-4 text-gray-700 leading-7'}>
        {entry.pageRole === 'pillar' ? (
          <p>
            This page is the main authority route for this topic cluster. Use it as the core reference,
            then pair it with{' '}
            <Link href={entry.supportingPage} className="text-primary font-medium hover:underline">
              {supportingAnchor}
            </Link>{' '}
            when you need the next practical step, a narrower supporting guide, or a scenario-led follow-on page.
          </p>
        ) : (
          <p>
            Use this page with the wider landlord workflow in mind. For the main authority route,
            start with{' '}
            <Link href={entry.primaryPillar} className="text-primary font-medium hover:underline">
              {pillarAnchor}
            </Link>
            . If you need the adjacent step next, move to{' '}
            <Link href={entry.supportingPage} className="text-primary font-medium hover:underline">
              {supportingAnchor}
            </Link>
            .
          </p>
        )}
        <p>
          When you are ready to act, the product-first route for this topic is{' '}
          <Link href={productHref} className="text-primary font-medium hover:underline">
            {productAnchor}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default SeoPageContextPanel;
