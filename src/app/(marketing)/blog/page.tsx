import { Metadata } from 'next';
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
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCTS } from '@/lib/pricing/products';
import { getBlogImagesForPost } from '@/lib/blog/image-manifest';

export const metadata: Metadata = {
  title: 'UK Landlord Guides: Eviction, Tenancy & Rent Arrears',
  description: 'Expert UK landlord guides on evictions, tenancy law, rent arrears, and compliance updates.',
  keywords: [
    'landlord guides',
    'eviction guide uk',
    'section 21 guide',
    'section 8 guide',
    'landlord advice',
    'tenancy law uk',
    'rent arrears advice',
    'property management tips',
  ],
  openGraph: {
    title: 'UK Landlord Guides: Eviction, Tenancy & Rent Arrears | Landlord Heaven',
    description: 'Expert guides for UK landlords on evictions, tenancy law, and property management.',
    type: 'website',
    url: getCanonicalUrl('/blog'),
  },
  alternates: {
    canonical: getCanonicalUrl('/blog'),
  },
};

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

      <main>
        {/* Hero Section */}
        <UniversalHero {...blogHeroConfig} />

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
        <section className="py-12 lg:py-16 bg-white border-b border-gray-100">
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

        {/* Featured Post */}
        <section className="bg-[#f8f1ff]/70 py-12 lg:py-16">
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
          <section className="py-12 lg:py-16 bg-white">
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
                Need to Serve an Eviction Notice?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Generate jurisdiction-specific, court-ready eviction case bundles in minutes.
                <span className="font-semibold text-gray-800"> AI-powered compliance with statutory-grounded preparation across England, Wales, and Scotland.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <Link
                  href="/products/notice-only"
                  className="hero-btn-primary"
                >
                  Generate Eviction Bundle — {PRODUCTS.notice_only.displayPrice} →
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="hero-btn-secondary"
                >
                  Complete Pack — {PRODUCTS.complete_pack.displayPrice} →
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
                  Court-ready guarantee
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
