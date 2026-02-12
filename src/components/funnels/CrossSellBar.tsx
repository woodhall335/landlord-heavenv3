import Link from 'next/link';

type CrossSellBarProps = {
  context: 'eviction' | 'money-claim';
  location?: 'above-fold' | 'mid' | 'bottom';
};

export function CrossSellBar({ context, location = 'mid' }: CrossSellBarProps) {
  const isEviction = context === 'eviction';

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm text-amber-900">
        <strong>You may also need:</strong>{' '}
        {isEviction ? (
          <>
            If arrears or damages are part of the case, add a{' '}
            <Link
              href="/products/money-claim"
              className="font-semibold underline hover:no-underline"
              data-cta="money-claim"
              data-cta-location={location}
            >
              money claim pack
            </Link>
            .
          </>
        ) : (
          <>
            If the tenant is still in the property, start eviction with our{' '}
            <Link
              href="/products/complete-pack"
              className="font-semibold underline hover:no-underline"
              data-cta="complete-pack"
              data-cta-location={location}
            >
              complete eviction pack
            </Link>
            .
          </>
        )}
      </p>
    </div>
  );
}
