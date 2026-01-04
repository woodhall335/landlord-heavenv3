import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/lib/seo/structured-data';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { AuthorBox } from '@/components/blog/AuthorBox';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogCard } from '@/components/blog/BlogCard';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { blogPosts, getBlogPost } from '@/lib/blog/posts';
import { Calendar, Clock, Tag, ChevronLeft, Share2 } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | Landlord Heaven`,
    description: post.metaDescription,
    keywords: [post.targetKeyword, ...post.secondaryKeywords],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updatedDate || post.date,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: post.heroImage || '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.heroImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.relatedPosts
    .map((relatedSlug) => getBlogPost(relatedSlug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.heroImage || 'https://landlordheaven.co.uk/og-image.png',
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Landlord Heaven',
      url: 'https://landlordheaven.co.uk',
      logo: {
        '@type': 'ImageObject',
        url: 'https://landlordheaven.co.uk/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://landlordheaven.co.uk/blog/${slug}`,
    },
    wordCount: post.wordCount,
    keywords: [post.targetKeyword, ...post.secondaryKeywords].join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://landlordheaven.co.uk',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://landlordheaven.co.uk/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://landlordheaven.co.uk/blog/${slug}`,
      },
    ],
  };

  // FAQ Schema for rich snippets (only if post has FAQs)
  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}

      <article className="min-h-screen">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-gray-50 to-white pt-8 pb-12 lg:pt-12 lg:pb-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-gray-900 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <div className="max-w-4xl">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                <span className="bg-primary text-white px-3 py-1 rounded-full font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
                <span className="text-gray-500">
                  {post.wordCount.toLocaleString()} words
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-8">
                {post.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Urgency Banner (for S21 posts) */}
        {post.showUrgencyBanner && (
          <div className="bg-primary text-white py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                <span className="font-semibold">Section 21 ends 1 May 2026 —</span>
                <Section21Countdown variant="compact" className="text-white font-bold" />
                <Link href="/products/notice-only" className="underline hover:no-underline font-medium">
                  Serve Your Notice Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12">
            {/* Main Content */}
            <div className="max-w-3xl">
              {/* Author */}
              <AuthorBox
                name={post.author.name}
                role={post.author.role}
                image={post.author.image}
              />

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-table:border-collapse prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-td:p-3 prose-td:border-b">
                {post.content}
              </div>

              {/* FAQ Section */}
              {post.faqs && post.faqs.length > 0 && (
                <section className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {post.faqs.map((faq, index) => (
                      <details
                        key={index}
                        className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-gray-900 hover:bg-gray-100 transition-colors">
                          {faq.question}
                          <span className="ml-4 flex-shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                            ▼
                          </span>
                        </summary>
                        <div className="p-4 pt-0 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Bottom CTA */}
              <BlogCTA variant="default" />

              {/* Share */}
              <div className="flex items-center justify-between py-8 border-t border-gray-100 mt-12">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to all guides
                </Link>
                <button className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                <TableOfContents items={post.tableOfContents} />

                {/* Sidebar CTA */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="font-semibold text-gray-900 mb-3">Need a Court-Ready Notice?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate legally compliant eviction notices in minutes.
                  </p>
                  <Link
                    href="/products/notice-only"
                    className="block w-full bg-primary hover:bg-primary/90 text-white text-center font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                  >
                    Get Section 21 — £29.99
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Guides</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard
                    key={relatedPost.slug}
                    slug={relatedPost.slug}
                    title={relatedPost.title}
                    description={relatedPost.description}
                    date={relatedPost.date}
                    readTime={relatedPost.readTime}
                    category={relatedPost.category}
                    heroImage={relatedPost.heroImage}
                    heroImageAlt={relatedPost.heroImageAlt}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
