import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo/structured-data';
import { BlogCard } from '@/components/blog/BlogCard';
import { blogPosts } from '@/lib/blog/posts';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { FileText, Scale, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Landlord Guides & Legal Resources | Landlord Heaven Blog',
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
        <section className="bg-primary text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <p className="font-semibold text-lg">
                Section 21 ends 1 May 2026
              </p>
              <Section21Countdown variant="compact" className="text-white font-bold" />
              <Link
                href="/section-21-ban"
                className="underline hover:no-underline font-medium"
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

        {/* All Guides */}
        {remainingPosts.length > 0 && (
          <section className="py-12 lg:py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">All Guides</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {remainingPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    slug={post.slug}
                    title={post.title}
                    description={post.description}
                    date={post.date}
                    readTime={post.readTime}
                    category={post.category}
                    heroImage={post.heroImage}
                    heroImageAlt={post.heroImageAlt}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Need to Serve an Eviction Notice?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Generate court-ready eviction notices in minutes. Our AI-powered system
                ensures your documents are legally compliant and accepted by courts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/notice-only"
                  className="bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Section 21 Notice — £29.99
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-lg border border-white/30 transition-colors"
                >
                  Complete Pack — £149.99
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Court-ready documents • AI-powered compliance • 80% cheaper than solicitors
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
