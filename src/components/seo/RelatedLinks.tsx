import Link from 'next/link';
import { ArrowRight, FileText, Calculator, Scale, Home } from 'lucide-react';

interface RelatedLink {
  href: string;
  title: string;
  description?: string;
  icon?: 'document' | 'calculator' | 'legal' | 'home';
  type?: 'product' | 'tool' | 'guide' | 'page';
}

interface RelatedLinksProps {
  title?: string;
  links: RelatedLink[];
  variant?: 'cards' | 'list' | 'inline';
  className?: string;
}

const iconMap = {
  document: FileText,
  calculator: Calculator,
  legal: Scale,
  home: Home,
};

export function RelatedLinks({
  title = 'Related Resources',
  links,
  variant = 'cards',
  className = ''
}: RelatedLinksProps) {
  if (variant === 'inline') {
    return (
      <div className={`my-6 ${className}`}>
        <span className="text-gray-600">Related: </span>
        {links.map((link, i) => (
          <span key={link.href}>
            <Link href={link.href} className="text-primary hover:underline">
              {link.title}
            </Link>
            {i < links.length - 1 && <span className="text-gray-400"> &bull; </span>}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`my-8 ${className}`}>
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {link.title}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Cards variant (default)
  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => {
              const Icon = link.icon ? iconMap[link.icon] : FileText;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start gap-4 p-4 bg-gray-50 hover:bg-primary/5 rounded-xl border border-gray-100 hover:border-primary/20 transition-all"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
