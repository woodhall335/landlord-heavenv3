import Image from 'next/image';
import { clsx } from 'clsx';

import type { ResidentialStandaloneTrustModule } from '@/lib/residential-letting/standalone-profiles';

interface StandaloneTrustModuleCardProps {
  module: ResidentialStandaloneTrustModule;
  className?: string;
  compact?: boolean;
}

export function StandaloneTrustModuleCard({
  module,
  className,
  compact = false,
}: StandaloneTrustModuleCardProps) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-violet-200 bg-white p-5 shadow-[0_12px_28px_rgba(76,29,149,0.10)]',
        compact && 'min-w-[280px] shrink-0',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
          <Image
            src={module.icon}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600">
            At a glance
          </p>
          <h3 className="mt-1 text-base font-semibold text-violet-950">{module.title}</h3>
        </div>
      </div>
      <ul className="mt-4 space-y-3 text-sm text-slate-700">
        {module.items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
