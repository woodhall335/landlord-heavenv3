import Image from 'next/image';
import Link from 'next/link';

type AssistedPrepSidebarConfig = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const SIDEBAR_CONFIG_BY_SLUG: Record<string, AssistedPrepSidebarConfig> = {
  'england-section-8-ground-14': {
    title: 'Need help preparing your Ground 14 notice?',
    description:
      'Start with a free consultation. If suitable, we can help prepare the Form 3A notice, service record and evidence file before you serve it.',
    href: '/assisted-prep/start?service=section8&product=notice_only&src=blog_ground_14_sidebar',
    imageSrc: '/images/heroes/library/hero-assisted-section8-v2.webp',
    imageAlt: 'Landlord reviewing a Section 8 assisted preparation file',
  },
  'scotland-eviction-ground-1': {
    title: 'Want a second pair of eyes before you act?',
    description:
      'Book a free consultation and we will review the route and documents with you. We only confirm paid assisted preparation if we can help.',
    href: '/assisted-prep?src=blog_scotland_ground_1_sidebar',
    imageSrc: '/images/heroes/library/hero-assisted-prep-overview-v2.webp',
    imageAlt: 'Landlord reviewing eviction paperwork during a free consultation',
  },
};

export function getBlogAssistedPrepSidebarConfig(slug: string): AssistedPrepSidebarConfig | null {
  const specificConfig = SIDEBAR_CONFIG_BY_SLUG[slug];
  if (specificConfig) return specificConfig;

  if (slug.startsWith('england-section-8-ground-')) {
    return {
      title: 'Need help preparing your Section 8 notice?',
      description:
        'Start with a free consultation. If suitable, we can help prepare the Form 3A notice, service record and supporting evidence before you serve it.',
      href: `/assisted-prep/start?service=section8&product=notice_only&src=blog_${slug}_sidebar`,
      imageSrc: '/images/heroes/library/hero-assisted-section8-v2.webp',
      imageAlt: 'Landlord reviewing a Section 8 assisted preparation file',
    };
  }

  if (slug.startsWith('scotland-eviction-ground-')) {
    return {
      title: 'Want a second pair of eyes before you act?',
      description:
        'Book a free consultation and we will review the route and documents with you. We only confirm paid assisted preparation if we can help.',
      href: `/assisted-prep?src=blog_${slug}_sidebar`,
      imageSrc: '/images/heroes/library/hero-assisted-prep-overview-v2.webp',
      imageAlt: 'Landlord reviewing eviction paperwork during a free consultation',
    };
  }

  return null;
}

export function BlogAssistedPrepSidebar({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const config = getBlogAssistedPrepSidebarConfig(slug);
  if (!config) return null;

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-[#ded0ff] bg-white shadow-[0_18px_42px_rgba(31,16,66,0.10)] ${className || ''}`}
      aria-label="Assisted preparation service"
    >
      <div className="relative aspect-[16/10] bg-[#f8f1ff]">
        <Image
          src={config.imageSrc}
          alt={config.imageAlt}
          fill
          sizes="(min-width: 1024px) 300px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d28d9]">
          Assisted prep
        </p>
        <h3 className="mt-2 text-xl font-bold leading-tight text-[#1c1431]">{config.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#5d5672]">{config.description}</p>
        <Link
          href={config.href}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#6d28d9] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#5b21b6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d28d9] focus-visible:ring-offset-2"
        >
          Book free consultation
        </Link>
      </div>
    </section>
  );
}
