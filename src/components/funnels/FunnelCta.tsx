import Link from 'next/link';

type SecondaryLink = {
  href: string;
  text: string;
  dataCta?: 'notice-only' | 'complete-pack' | 'money-claim' | 'ast';
};

type FunnelCtaProps = {
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryText: string;
  primaryDataCta?: 'notice-only' | 'complete-pack' | 'money-claim' | 'ast';
  location?: 'above-fold' | 'mid' | 'bottom';
  secondaryLinks?: SecondaryLink[];
  className?: string;
};

export function FunnelCta({
  title,
  subtitle,
  primaryHref,
  primaryText,
  primaryDataCta,
  location = 'mid',
  secondaryLinks = [],
  className,
}: FunnelCtaProps) {
  return (
    <section className={`rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 ${className ?? ''}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-700 mb-5">{subtitle}</p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href={primaryHref}
          className="hero-btn-primary inline-flex items-center justify-center"
          data-cta={primaryDataCta}
          data-cta-location={location}
        >
          {primaryText}
        </Link>
        {secondaryLinks.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {secondaryLinks.slice(0, 2).map((link) => (
              <Link
                key={`${link.href}-${link.text}`}
                href={link.href}
                className="text-primary font-medium hover:underline"
                data-cta={link.dataCta}
                data-cta-location={location}
              >
                {link.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
