import { ShieldCheck } from 'lucide-react';
import { POSITIONING_BULLETS, POSITIONING_ONE_LINER } from '@/lib/marketing/positioning';
import { clsx } from 'clsx';

interface TrustPositioningBarProps {
  variant?: 'compact' | 'full';
  items?: string[];
  className?: string;
}

export function TrustPositioningBar({ variant = 'compact', items, className }: TrustPositioningBarProps) {
  const bulletItems = (items?.length ? items : Array.from(POSITIONING_BULLETS)).slice(0, variant === 'compact' ? 3 : 4);

  return (
    <div className={clsx('mt-6 rounded-2xl border border-white/35 bg-white/12 p-4 text-white backdrop-blur-sm', className)}>
      <p className={clsx('font-semibold text-white', variant === 'compact' ? 'text-sm md:text-base' : 'text-base md:text-lg')}>
        {POSITIONING_ONE_LINER}
      </p>
      <ul className={clsx('mt-3 grid gap-2', variant === 'compact' ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {bulletItems.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-white/90">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
