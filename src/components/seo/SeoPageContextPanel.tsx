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
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Reviewed
            </p>
            <p className="mt-2 text-sm text-gray-700">{freshness.reviewedDate}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Applies to
            </p>
            <p className="mt-2 text-sm text-gray-700">{freshness.jurisdictionScope}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Current position
            </p>
            <p className="mt-2 text-sm text-gray-700">{freshness.legalContextNote}</p>
          </div>
        </div>
      ) : null}

      <div
        className={
          freshness
            ? 'mt-6 space-y-4 leading-7 text-gray-700'
            : 'space-y-4 leading-7 text-gray-700'
        }
      >
        <p>
          Start here if you need the main guide on this issue. If your situation is
          narrower or you want the next practical step, go to{' '}
          <Link href={entry.supportingPage} className="font-medium text-primary hover:underline">
            {supportingAnchor}
          </Link>
          .
        </p>
        <p>
          If you want the wider background first, read{' '}
          <Link href={entry.primaryPillar} className="font-medium text-primary hover:underline">
            {pillarAnchor}
          </Link>
          .
        </p>
        <p>
          Ready to act? The quickest route from here is{' '}
          <Link href={productHref} className="font-medium text-primary hover:underline">
            {productAnchor}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default SeoPageContextPanel;
