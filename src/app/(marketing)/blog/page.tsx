import Link from 'next/link';
import Image from 'next/image';
import { StructuredData } from '@/lib/seo/structured-data';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilteredList } from '@/components/blog/BlogFilteredList';
import { blogPosts } from '@/lib/blog/posts';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { BLOG_CATEGORIES, getPostCountsByRegion, BlogRegion } from '@/lib/blog/categories';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { blogHeroConfig } from '@/components/landing/heroConfigs';
import { ArrowRight } from 'lucide-react';
import { generateMetadata } from '@/lib/seo';
import { PRODUCTS } from '@/lib/pricing/products';
import { getBlogImagesForPost } from '@/lib/blog/image-manifest';
import { BLOG_TOPIC_HUBS } from '@/lib/blog/topic-hubs';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata = generateMetadata({
  title: 'UK Landlord Guides | Eviction, Tenancy & Rent Arrears',
  description:
    'Read UK landlord guides on Section 8, eviction notices, rent arrears, tenancy agreements, possession claims, and compliance updates.',
  path: '/blog',
  keywords: [
    'how to evict a tenant',
    'eviction notice',
    'section 8',
    'rent arrears',
    'tenancy agreement',
    'possession claim',
    'landlord compliance',
  ],
});

export default function BlogPage() {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Landlord Heaven Blog',
    description: 'Expert guides and resources for UK landlords on evictions, tenancy law, and property management.',
    url: 'https://landlordheaven.co.uk/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Landlord Heaven',
      url: 'https://landlordheaven.co.uk',
    },
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://landlordheaven.co.uk/blog/${post.slug}`,
    })),
  };

  const featuredPost = blogPosts[0];
  const featuredPostImages = getBlogImagesForPost({
    slug: featuredPost.slug,
    title: featuredPost.title,
    targetKeyword: featuredPost.targetKeyword,
    category: featuredPost.category,
    tags: featuredPost.tags,
  });
  const remainingPosts = blogPosts.slice(1);

  // Extract unique categories sorted alphabetically
  const categories = [...new Set(blogPosts.map((post) => post.category))].sort();

  // Prepare posts data for client component (without JSX content)
  const postsForFilter = remainingPosts.map((post) => {
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
        {/* Hero Section */}
        <UniversalHero {...blogHeroConfig} />


        <section className="border-b border-[#ede2ff] bg-[#f8f1ff]/70 py-8 lg:py-11">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded-full border border-[#e3d3ff] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#692ed4]">LandlordHeaven Blog</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">Landlord help that tells you what to do next</h2>
              <p className="mt-4 text-lg text-slate-600">Start with the problem in plain English, then move to the right next step when you are ready.</p>
            </div>
          </div>
        </section>

        {/* Urgency Banner */}
        <section className="bg-primary py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white">
              <span className="font-semibold text-lg text-white">
                Section 21 ends 1 May 2026
              </span>
              <Section21Countdown variant="compact" className="text-white font-bold" />
              <Link
                href="/section-21-ban"
                className="text-white underline hover:no-underline font-medium"
              >
                Learn what this means for you
              </Link>
            </div>
          </div>
        </section>

        {/* Browse by Region */}
        <section id="blog-jurisdictions" className="border-b border-gray-100 bg-white py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Browse Guides by Jurisdiction
            </h2>
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
              UK tenancy laws vary significantly between England, Scotland, Wales, and Northern Ireland.
              Find guides specific to your property location.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(BLOG_CATEGORIES).map(([key, config]) => {
                const region = key as BlogRegion;
                const postCounts = getPostCountsByRegion(blogPosts);
                const count = postCounts[region];

                return (
                  <Link
                    key={region}
                    href={`/blog/${region}`}
                    className="group bg-gray-50 rounded-xl border border-gray-200 p-6 hover:border-primary hover:bg-white hover:shadow-lg transition-all text-center"
                  >
                    <Image
                      src={config.flag}
                      alt={config.name}
                      width={40}
                      height={30}
                      className="w-10 h-7 mx-auto mb-3 rounded shadow-sm"
                    />
                    <span className="block font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1">
                      {config.name}
                    </span>
                    <span className="text-sm text-gray-500 block mb-3">
                      {count} guide{count !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center text-sm text-primary font-medium">
                      View
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
              Pick the problem you are dealing with: Section 8, rent arrears, tenancy setup, or region-specific rules.
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Object.values(BLOG_TOPIC_HUBS).map((hub) => (
                <Link key={hub.slug} href={`/blog/${hub.slug}`} className="rounded-xl border border-[#e3d3ff] bg-[#fdfaff] p-5 transition hover:border-[#c6a2ff] hover:shadow-sm">
                  <p className="text-sm font-semibold text-[#692ed4]">{hub.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{hub.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
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

        {/* All Guides with Search & Filter */}
        {remainingPosts.length > 0 && (
          <section className="bg-white py-10 lg:py-14">
            <div className="container mx-auto px-4">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">All Guides</h2>
              <p className="mb-8 max-w-2xl text-gray-600">Browse practical, court-focused guides designed to help you pick the right product path faster.</p>
              <BlogFilteredList posts={postsForFilter} categories={categories} />
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Need help choosing your next landlord step?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Start with the route that matches your problem: serve the right notice, prepare the court stage, or recover unpaid rent.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <Link
                  href="/products/notice-only"
                  className="hero-btn-primary"
                >
                  Generate your eviction notice — {PRODUCTS.notice_only.displayPrice} →
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="hero-btn-secondary"
                >
                  See the court pack — {PRODUCTS.complete_pack.displayPrice} →
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500">
                <span className="flex items-center gap-2">
                  <Image src="/images/wizard-icons/50-success.png" alt="Ready to file" width={20} height={20} className="h-5 w-5" />
                  Ready to file
                </span>
                <span className="flex items-center gap-2">
                  <Image src="/images/wizard-icons/05-compliance.png" alt="Court-ready" width={20} height={20} className="h-5 w-5" />
                  Built on the forms courts expect
                </span>
                <span className="flex items-center gap-2">
                  <Image src="/images/wizard-icons/46-premium.png" alt="All UK jurisdictions" width={20} height={20} className="h-5 w-5" />
                  All UK jurisdictions
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
