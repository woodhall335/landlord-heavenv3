import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { StructuredData } from '@/lib/seo/structured-data';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilteredList } from '@/components/blog/BlogFilteredList';
import { blogPosts } from '@/lib/blog/posts';
import {
  BLOG_CATEGORIES,
  getPostCountsByRegion,
  getPostRegion,
  getPublicBlogRegions,
  isPublicBlogDiscoveryRegion,
  type BlogRegion,
} from '@/lib/blog/categories';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { blogHeroConfig } from '@/components/landing/heroConfigs';
import { ArrowRight } from 'lucide-react';
import { generateMetadata as buildSeoMetadata } from '@/lib/seo';
import { PRODUCTS } from '@/lib/pricing/products';
import { getBlogImagesForPost } from '@/lib/blog/image-manifest';
import { BLOG_TOPIC_HUBS, getPublicTopicHubs } from '@/lib/blog/topic-hubs';

const REGION_ILLUSTRATIONS: Record<BlogRegion, { src: string; alt: string }> = {
  england: {
    src: '/images/blog/england-registration-regional-rollout-2026.webp',
    alt: 'Illustrated map and property records for landlords in England',
  },
  scotland: {
    src: '/images/blog/blog-region-scotland-watercolour-2026.webp',
    alt: 'Illustrated Scottish landlord registration guide',
  },
  wales: {
    src: '/images/blog/blog-region-wales-watercolour-2026.webp',
    alt: 'Illustrated Rent Smart Wales landlord guide',
  },
  'northern-ireland': {
    src: '/images/blog/blog-region-northern-ireland-watercolour-2026.webp',
    alt: 'Illustrated Northern Ireland landlord registration guide',
  },
  uk: {
    src: '/images/blog/landlord-registration-uk-regions-2026.webp',
    alt: 'Illustrated comparison of landlord requirements across the UK',
  },
};

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

type BlogSearchParams = Record<string, string | string[] | undefined>;

const blogMetadata = buildSeoMetadata({
  title: 'England Landlord Guides | Section 8, Possession & Tenancy Help',
  description:
    'Read England landlord guides on Section 8 notices, possession claims, tenancy agreements, rent arrears, compliance steps, and the right product route.',
  path: '/blog',
  keywords: [
    'how to evict a tenant in england',
    'section 8 notice england',
    'section 8',
    'rent arrears',
    'tenancy agreement england',
    'possession claim england',
    'landlord compliance',
  ],
});

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<BlogSearchParams> | BlogSearchParams;
} = {}): Promise<Metadata> {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<BlogSearchParams>).then === 'function'
      ? await (searchParams as Promise<BlogSearchParams>)
      : (searchParams as BlogSearchParams | undefined);
  const hasQueryParams = Object.entries(resolvedSearchParams ?? {}).some(
    ([, value]) => value !== undefined
  );

  return {
    ...blogMetadata,
    robots: hasQueryParams ? { index: false, follow: true } : blogMetadata.robots,
  };
}

export default function BlogPage() {
  const publicPosts = blogPosts.filter((post) =>
    isPublicBlogDiscoveryRegion(getPostRegion(post.slug))
  );
  const featuredPost = publicPosts[0] ?? blogPosts[0];
  const postCounts = getPostCountsByRegion(publicPosts);
  const publicTopicHubs = getPublicTopicHubs().map((slug) => BLOG_TOPIC_HUBS[slug]);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Landlord Heaven Blog',
    description:
      'Expert England landlord guides on Section 8 notices, possession claims, tenancy agreements, rent arrears, and compliance.',
    url: 'https://landlordheaven.co.uk/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Landlord Heaven',
      url: 'https://landlordheaven.co.uk',
    },
    blogPost: publicPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://landlordheaven.co.uk/blog/${post.slug}`,
    })),
  };

  const featuredPostImages = getBlogImagesForPost({
    slug: featuredPost.slug,
    title: featuredPost.title,
    targetKeyword: featuredPost.targetKeyword,
    category: featuredPost.category,
    tags: featuredPost.tags,
  });

  const categories = [...new Set(publicPosts.map((post) => post.category))].sort();

  const postsForFilter = publicPosts.map((post) => {
    const manifestImages = getBlogImagesForPost({
      slug: post.slug,
      title: post.title,
      targetKeyword: post.targetKeyword,
      category: post.category,
      tags: post.tags,
    });

    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      readTime: post.readTime,
      category: post.category,
      heroImage: manifestImages.hero,
      heroImageAlt: post.heroImageAlt,
    };
  });

  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={blogSchema} />

      <main className="overflow-x-clip">
        <UniversalHero
          {...blogHeroConfig}
          variant="pastel"
          backgroundImageKey="blogEviction"
          backgroundImageAlt="Watercolour illustration of landlord eviction guides and court documents"
        />

        <section className="border-b border-[#ede2ff] bg-[#f8f1ff]/70 py-8 lg:py-11">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-12">
              <div>
              <p className="mb-3 inline-flex rounded-full border border-[#e3d3ff] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#692ed4]">
                LandlordHeaven Blog
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Landlord help that tells you what to do next
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Start with the problem in plain English, understand the evidence and legal steps,
                then choose a product only when it fits what you need to do.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Use these guides when you are not sure whether the next step is a Section 8 notice,
                possession claim, money claim, rent increase notice, tenancy agreement, or a free
                tool. Each guide gives a direct answer, explains the evidence and compliance points
                that matter and links to the relevant documents where appropriate.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                <div className="rounded-xl border border-[#e3d3ff] bg-white p-4">
                  <h3 className="font-semibold text-slate-900">Answer first</h3>
                  <p className="mt-2 leading-6">
                    Start with the short answer, then read the deeper process if you need more context.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e3d3ff] bg-white p-4">
                  <h3 className="font-semibold text-slate-900">Evidence next</h3>
                  <p className="mt-2 leading-6">
                    Check dates, notices, arrears records, service proof, and tenancy documents before acting.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e3d3ff] bg-white p-4">
                  <h3 className="font-semibold text-slate-900">Relevant next step</h3>
                  <p className="mt-2 leading-6">
                    Move into Notice Only, Complete Pack, Money Claim, rent increase, or tenancy agreement support when the guide shows a clear fit.
                  </p>
                </div>
              </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-[#e3d3ff] bg-white p-3 shadow-[0_18px_50px_rgba(105,46,212,0.12)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f8f1ff]">
                  <Image
                    src="/images/blog/blog-hub-guidance-watercolour-2026.webp"
                    alt="Illustrated collection of practical support resources for landlords"
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-violet-100 bg-violet-50/70 py-8">
          <div className="container mx-auto px-4">
            <Link
              href="/blog/new-landlord-registration-requirements-england-uk-regions"
              className="group mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-violet-200 bg-white p-6 shadow-sm transition hover:border-violet-400 hover:shadow-md md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-700">
                  New legal update · 15 September 2026
                </p>
                <h2 className="mt-2 text-xl font-bold text-gray-950 md:text-2xl">
                  England landlord registration starts regionally in December 2026
                </h2>
                <p className="mt-2 max-w-3xl text-gray-600">
                  See the confirmed West Midlands launch, the England rollout deadline, what to
                  prepare, and how the rules differ in Wales, Scotland and Northern Ireland.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center font-semibold text-violet-700">
                Read the registration guide
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>

        <section
          id="blog-jurisdictions"
          className="border-b border-gray-100 bg-white py-10 lg:py-14"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Landlord Guides by Region
            </h2>
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
              Choose the region where the property is located to see the registration, tenancy
              and possession guidance that applies there.
            </p>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {getPublicBlogRegions().map((region) => {
                const config = BLOG_CATEGORIES[region];
                const count = postCounts[region as BlogRegion];
                const illustration = REGION_ILLUSTRATIONS[region as BlogRegion];

                return (
                  <Link
                    key={region}
                    href={`/blog/${region}`}
                    className="group overflow-hidden rounded-2xl border border-[#e3d3ff] bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                  >
                    <span className="relative block aspect-[16/9] overflow-hidden border-b border-[#eee5fb] bg-[#f8f1ff]">
                      <Image
                        src={illustration.src}
                        alt={illustration.alt}
                        fill
                        sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                      />
                    </span>
                    <span className="block p-5 text-left">
                      <span className="flex items-center gap-3">
                        <Image
                          src={config.flag}
                          alt=""
                          aria-hidden
                          width={40}
                          height={30}
                          className="h-7 w-10 rounded shadow-sm"
                        />
                        <span className="font-semibold text-gray-900 transition-colors group-hover:text-primary">
                          {config.name}
                        </span>
                      </span>
                      <span className="mt-3 block text-sm text-gray-500">
                        {count} guide{count !== 1 ? 's' : ''}
                      </span>
                      <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                        View guides
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="blog-topic-hubs" className="border-b border-gray-100 bg-white py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Browse by Problem</h2>
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
              Pick the England landlord problem you are dealing with: Section 8, rent arrears,
              possession steps, or compliance that could trip your case up later.
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {publicTopicHubs.map((hub) => (
                <Link
                  key={hub.slug}
                  href={`/blog/${hub.slug}`}
                  className="rounded-xl border border-[#e3d3ff] bg-[#fdfaff] p-5 transition hover:border-[#c6a2ff] hover:shadow-sm"
                >
                  <p className="text-sm font-semibold text-[#692ed4]">{hub.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{hub.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="featured-guide" className="bg-[#f8f1ff]/70 py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Guide</h2>
            <BlogCard
              slug={featuredPost.slug}
              title={featuredPost.title}
              description={featuredPost.description}
              date={featuredPost.date}
              readTime={featuredPost.readTime}
              category={featuredPost.category}
              heroImage={featuredPostImages.hero}
              heroImageAlt={featuredPost.heroImageAlt}
              featured
            />
          </div>
        </section>

        {publicPosts.length > 0 && (
          <section className="bg-white py-10 lg:py-14">
            <div className="container mx-auto px-4">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">All Guides</h2>
              <p className="mb-8 max-w-2xl text-gray-600">
                Browse practical landlord guides designed to help you understand the issue quickly,
                then choose the product that actually fits.
              </p>
              <BlogFilteredList posts={postsForFilter} categories={categories} />
            </div>
          </section>
        )}

        <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Need help choosing your next landlord step?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Start with what you need to do: serve the notice, prepare for court, recover unpaid
                rent, or sort out the tenancy paperwork.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <Link href="/products/notice-only" className="hero-btn-primary">
                  Create my Section 8 notice - {PRODUCTS.notice_only.displayPrice} -&gt;
                </Link>
                <Link href="/products/complete-pack" className="hero-btn-secondary">
                  Prepare my court pack - {PRODUCTS.complete_pack.displayPrice} -&gt;
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500">
                <span className="flex items-center gap-2">
                  <Image
                    src="/images/wizard-icons/50-success.png"
                    alt="Ready to file"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  Ready to file
                </span>
                <span className="flex items-center gap-2">
                  <Image
                    src="/images/wizard-icons/05-compliance.png"
                    alt="Court-ready"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  Built on the forms courts expect
                </span>
                <span className="flex items-center gap-2">
                  <Image
                    src="/images/wizard-icons/46-premium.png"
                    alt="For landlords in England"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  For landlords in England
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
