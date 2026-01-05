import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo/structured-data';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilteredList } from '@/components/blog/BlogFilteredList';
import { blogPosts } from '@/lib/blog/posts';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { FileText, Scale, Clock, Zap, ShieldCheck, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Landlord Guides & Legal Resources',
  description: 'Expert guides for UK landlords on evictions, Section 21, Section 8, tenancy law, rent arrears, and property management. Free legal advice from property experts.',
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
    title: 'Landlord Guides & Legal Resources | Landlord Heaven',
    description: 'Expert guides for UK landlords on evictions, tenancy law, and property management.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/blog',
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
  const remainingPosts = blogPosts.slice(1);

  // Extract unique categories sorted alphabetically
  const categories = [...new Set(blogPosts.map((post) => post.category))].sort();

  // Prepare posts data for client component (without JSX content)
  const postsForFilter = remainingPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    readTime: post.readTime,
    category: post.category,
    heroImage: post.heroImage,
    heroImageAlt: post.heroImageAlt,
  }));

  return (
    <>
      <StructuredData data={blogSchema} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <FileText className="w-4 h-4" />
                Free Landlord Resources
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Landlord Guides & Legal Resources
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Expert advice on evictions, tenancy law, and property management.
                Written by legal professionals, trusted by thousands of UK landlords.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  <span>Legally Accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Updated for 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{blogPosts.length} Guides Available</span>
                </div>
              </div>
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

        {/* Featured Post */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Guide</h2>
            <BlogCard
              slug={featuredPost.slug}
              title={featuredPost.title}
              description={featuredPost.description}
              date={featuredPost.date}
              readTime={featuredPost.readTime}
              category={featuredPost.category}
              heroImage={featuredPost.heroImage}
              heroImageAlt={featuredPost.heroImageAlt}
              featured
            />
          </div>
        </section>

        {/* All Guides with Search & Filter */}
        {remainingPosts.length > 0 && (
          <section className="py-12 lg:py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">All Guides</h2>
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
                Generate court-ready eviction notices in minutes.
                <span className="font-semibold text-gray-800"> AI-powered compliance, 80% cheaper than solicitors.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <Link
                  href="/products/notice-only"
                  className="hero-btn-primary"
                >
                  Section 21 Notice — £29.99 →
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="hero-btn-secondary"
                >
                  Complete Pack — £149.99 →
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Instant download
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Court-ready guarantee
                </span>
                <span className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
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
