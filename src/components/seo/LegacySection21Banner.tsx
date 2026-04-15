import Link from 'next/link';
import {
  SECTION21_END_DATE,
  SECTION21_PRE_CHANGE_BRIDGE,
  SECTION21_PRE_CHANGE_SUMMARY,
} from '@/lib/seo/section21-transition-copy';

interface LegacySection21BannerProps {
  compact?: boolean;
  className?: string;
}

export function LegacySection21Banner({
  compact = false,
  className = '',
}: LegacySection21BannerProps) {
  return (
    <div
      className={`rounded-2xl border border-[#F4C48B] bg-[#FFF7ED] p-5 text-[#7C2D12] shadow-[0_10px_30px_rgba(154,52,18,0.08)] ${className}`.trim()}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C2410C]">
        Historical Only
      </p>
      <h2 className="mt-3 text-xl font-bold text-[#431407]">
        Section 21 Is Ending In England
      </h2>
      <p className="mt-3 text-sm leading-7 md:text-base">
        {SECTION21_PRE_CHANGE_SUMMARY} We are aligned with the Renters&apos; Rights Act, so live
        England case planning should already be based on the current possession and eviction
        workflow rather than older Section 21 assumptions.
      </p>
      <p className={`text-sm leading-7 md:text-base ${compact ? 'mt-2' : 'mt-3'}`}>
        {SECTION21_PRE_CHANGE_BRIDGE} Treat any Section 21 wording on this page as transition
        support only, and use the current notice, claim, and court guidance that landlords need
        from {SECTION21_END_DATE}.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/eviction-process-england"
          className="hero-btn-primary"
        >
          See the current England process
        </Link>
        <Link
          href="/products/notice-only"
          className="hero-btn-secondary"
        >
          Start the current notice pack
        </Link>
        <Link
          href="/n5-n119-possession-claim"
          className="hero-btn-secondary"
        >
          View the current claim route
        </Link>
      </div>
    </div>
  );
}

export default LegacySection21Banner;
