import Link from 'next/link';
import Image from 'next/image';
import { StructuredData } from '@/lib/seo/structured-data';
import { BlogCard } from './BlogCard';
import { BlogFilteredList } from './BlogFilteredList';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { BlogRegion, CategoryConfig, BLOG_CATEGORIES, getPostCountsByRegion } from '@/lib/blog/categories';
import { blogPosts } from '@/lib/blog/posts';
import { FileText, MapPin, ArrowRight, Scale, Clock } from 'lucide-react';
import { getCanonicalUrl, SITE_ORIGIN } from '@/lib/seo';

interface CategoryPageProps {
  region: BlogRegion;
  posts: Array<{
    slug: string;
    title: string;
    description: string;
    date: string;
    readTime: string;
    category: string;
    heroImage: string;
    heroImageAlt: string;
  }>;
}

export function CategoryPage({ region, posts }: CategoryPageProps) {
  const config = BLOG_CATEGORIES[region];
  const postCounts = getPostCountsByRegion(blogPosts);
  const categories = [...new Set(posts.map((post) => post.category))].sort();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  // Generate structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_ORIGIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Landlord Guides',
        item: `${SITE_ORIGIN}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.name,
        item: `${SITE_ORIGIN}/blog/${region}`,
      },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: config.title,
    description: config.description,
    url: `${SITE_ORIGIN}/blog/${region}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_ORIGIN}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  // Other regions for cross-linking
  const otherRegions = Object.entries(BLOG_CATEGORIES)
    .filter(([key]) => key !== region)
    .map(([key, value]) => ({
      ...value,
      count: postCounts[key as BlogRegion],
    }));

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={collectionSchema} />

      <main>
        {/* Hero Section - matches homepage pastel gradient */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-primary transition-colors">Landlord Guides</Link>
              <span>/</span>
              <span className="text-gray-900">{config.name}</span>
            </nav>

            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Image
                  src={config.flag}
                  alt={config.name}
                  width={32}
                  height={24}
                  className="w-8 h-6 rounded shadow-sm"
                />
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  {config.name} Jurisdiction
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {config.title}
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                {config.description}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{posts.length} Guides</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  <span>Legally Accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Updated for 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Urgency Banner for England */}
        {region === 'england' && (
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
                  Learn what this means
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Related Topics */}
        <section className="py-8 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Related topics:</span>
              {config.relatedTopics.map((topic) => (
                <span
                  key={topic}
                  className="text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-700"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured {config.name} Guide</h2>
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
        )}

        {/* All Guides */}
        {remainingPosts.length > 0 && (
          <section className="py-12 lg:py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">All {config.name} Guides</h2>
              <BlogFilteredList posts={remainingPosts} categories={categories} />
            </div>
          </section>
        )}

        {/* Cross-Link to Other Regions */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Browse Other Jurisdictions
            </h2>
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
              Different parts of the UK have different tenancy laws. Find guides specific to your jurisdiction.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {otherRegions.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={r.flag}
                      alt={r.name}
                      width={24}
                      height={18}
                      className="w-6 h-4 rounded shadow-sm"
                    />
                    <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {r.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {r.count} guide{r.count !== 1 ? 's' : ''}
                  </p>
                  <span className="inline-flex items-center text-sm text-primary font-medium">
                    View guides
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Need Legal Documents for {config.name}?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Generate court-ready notices and agreements compliant with {config.name} law.
                <span className="font-semibold text-gray-800"> AI-powered compliance checks included.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <Link
                  href="/pricing"
                  className="hero-btn-primary"
                >
                  View All Products
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="hero-btn-secondary"
                >
                  Complete Eviction Pack
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default CategoryPage;
