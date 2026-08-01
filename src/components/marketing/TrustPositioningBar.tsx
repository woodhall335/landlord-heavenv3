import { ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import {
  getPositioningContent,
  type PositioningPreset,
} from '@/lib/marketing/positioning';

interface TrustPositioningBarProps {
  variant?: 'compact' | 'full';
  preset?: PositioningPreset;
  headline?: string;
  items?: string[];
  className?: string;
}

export function TrustPositioningBar({
  variant = 'compact',
  preset = 'default',
  headline,
  items,
  className,
}: TrustPositioningBarProps) {
  const content = getPositioningContent(preset);
  const resolvedHeadline = headline ?? content.headline;
  const bulletItems = (items?.length ? items : Array.from(content.bullets)).slice(
    0,
    variant === 'compact' ? 3 : 4
  );

  return (
    <div className={clsx('mt-6 rounded-2xl border border-[#e5ddf7] bg-white/86 p-4 text-[#271b45] shadow-sm backdrop-blur-sm', className)}>
      <p className={clsx('font-semibold text-[#271b45]', variant === 'compact' ? 'text-sm md:text-base' : 'text-base md:text-lg')}>
        {resolvedHeadline}
      </p>
      <ul className={clsx('mt-3 grid gap-2', variant === 'compact' ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {bulletItems.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#514765]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#6333d5]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
