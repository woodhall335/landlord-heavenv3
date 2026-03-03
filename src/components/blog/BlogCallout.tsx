import Image from 'next/image';
import { PropsWithChildren } from 'react';

type BlogCalloutVariant = 'legal' | 'info' | 'warning' | 'quote';

interface BlogCalloutProps extends PropsWithChildren {
  title?: string;
  variant?: BlogCalloutVariant;
  iconSrc?: string;
  iconAlt?: string;
  className?: string;
}

const variantStyles: Record<BlogCalloutVariant, string> = {
  legal: 'border-[#d9c2ff] bg-[#f8f1ff] text-slate-700',
  info: 'border-[#dfcdfd] bg-[#f8f1ff] text-slate-700',
  warning: 'border-[#b286ff] bg-[#f8f1ff] text-slate-800',
  quote: 'border-[#c7a5ff] bg-[#f8f1ff] text-slate-700 italic',
};

export function BlogCallout({
  title,
  variant = 'info',
  iconSrc,
  iconAlt,
  className = '',
  children,
}: BlogCalloutProps) {
  return (
    <section className={`my-7 rounded-2xl border px-5 py-4 leading-6 ${variantStyles[variant]} ${className}`.trim()}>
      <div className="flex items-start gap-3">
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={iconAlt ?? ''}
            width={24}
            height={24}
            aria-hidden={!iconAlt}
            className="mt-0.5 h-6 w-6 shrink-0 rounded-md bg-white/70 p-0.5"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {title ? <h3 className="mb-1 text-sm font-semibold not-italic text-slate-900">{title}</h3> : null}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function LegalDisclaimer({ children }: PropsWithChildren) {
  return (
    <BlogCallout variant="legal" title="Legal disclaimer" iconSrc="/images/wizard-icons/05-compliance.png" iconAlt="Compliance icon">
      {children}
    </BlogCallout>
  );
}

export function WarningCallout({ title = 'Important', children }: PropsWithChildren<{ title?: string }>) {
  return (
    <BlogCallout variant="warning" title={title} iconSrc="/images/wizard-icons/49-warning.png" iconAlt="Warning icon">
      {children}
    </BlogCallout>
  );
}
