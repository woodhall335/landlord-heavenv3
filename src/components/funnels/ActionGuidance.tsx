import Link from 'next/link';

type ActionGuidanceProps = {
  todayLine: string;
  ctaHref: string;
  ctaLabel: string;
  className?: string;
  variant?: 'dark' | 'light';
};

export function ActionGuidance({
  todayLine,
  ctaHref,
  ctaLabel,
  className,
  variant = 'dark',
}: ActionGuidanceProps) {
  const isLight = variant === 'light';

  return (
    <div
      className={`mt-6 rounded-xl p-4 ${
        isLight
          ? 'border border-[#e7d9ff] bg-white text-gray-900 shadow-sm'
          : 'border border-white/30 bg-white/15 text-white backdrop-blur-sm'
      } ${className ?? ''}`}
    >
      <p className="text-sm font-semibold">You&apos;re in the right place.</p>
      <p className={`mt-1 text-sm ${isLight ? 'text-gray-700' : 'text-white/90'}`}>{todayLine}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-white/90'}`}>Click this one best next step.</p>
        <Link
          href={ctaHref}
          className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold ${
            isLight ? 'bg-[#692ed4] text-white hover:bg-[#5a24b8]' : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
          data-cta="page-action-guidance"
          data-cta-location="hero"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
