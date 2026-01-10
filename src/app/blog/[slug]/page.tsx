import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/lib/seo/structured-data';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { AuthorBox } from '@/components/blog/AuthorBox';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { RelatedGuidesCarousel } from '@/components/blog/RelatedGuidesCarousel';
import { NextSteps } from '@/components/blog/NextSteps';
import { Sources } from '@/components/blog/Sources';
import { CategoryPage } from '@/components/blog/CategoryPage';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { blogPosts, getBlogPost } from '@/lib/blog/posts';
import { BlogPost } from '@/lib/blog/types';
import {
  getPostRegion,
  getPostsByRegion,
  getValidRegions,
  getCategoryConfig,
  BLOG_CATEGORIES,
  BlogRegion,
} from '@/lib/blog/categories';
import { Calendar, Clock, Tag, ChevronLeft, Share2, RefreshCw, CheckCircle } from 'lucide-react';
import { getCanonicalUrl, SITE_ORIGIN } from '@/lib/seo';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import type { AskHeavenTopic } from '@/lib/ask-heaven/buildAskHeavenLink';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

// Check if a slug is a valid category/region
function isValidCategory(slug: string): slug is BlogRegion {
  return getValidRegions().includes(slug as BlogRegion);
}

// Map blog post slugs/tags to Ask Heaven topics for compliance posts
const COMPLIANCE_TOPIC_MAP: Record<string, { topic: AskHeavenTopic; prompt: string; title: string }> = {
  // Deposit protection
  'uk-deposit-protection-guide': {
    topic: 'deposit',
    prompt: 'Do I need to protect a tenancy deposit and when?',
    title: 'Question about deposit protection?',
  },
  'england-deposit-protection': {
    topic: 'deposit',
    prompt: 'What are the deposit protection rules in England?',
    title: 'Question about deposit protection?',
  },
  'scotland-deposit-protection': {
    topic: 'deposit',
    prompt: 'How does deposit protection work in Scotland?',
    title: 'Question about deposit protection?',
  },
  'wales-deposit-protection': {
    topic: 'deposit',
    prompt: 'What are the deposit rules under the Renting Homes Act?',
    title: 'Question about deposit protection?',
  },
  'northern-ireland-deposit-protection': {
    topic: 'deposit',
    prompt: 'How does tenancy deposit protection work in Northern Ireland?',
    title: 'Question about deposit protection?',
  },
  // Gas safety
  'uk-gas-safety-landlords': {
    topic: 'gas_safety',
    prompt: 'When must a landlord provide a gas safety certificate?',
    title: 'Question about gas safety?',
  },
  // Fire safety (smoke & CO alarms)
  'uk-fire-safety-landlords': {
    topic: 'smoke_alarms',
    prompt: 'What are the smoke alarm rules for landlords?',
    title: 'Question about fire safety?',
  },
  'uk-smoke-co-alarm-regulations-guide': {
    topic: 'smoke_alarms',
    prompt: 'What changed in the Smoke and Carbon Monoxide Alarm Regulations 2022?',
    title: 'Question about smoke or CO alarms?',
  },
  // Right to rent
  'uk-right-to-rent-checks': {
    topic: 'right_to_rent',
    prompt: 'Do I need to do right to rent checks and how?',
    title: 'Question about right to rent?',
  },
  'uk-right-to-rent-guide': {
    topic: 'right_to_rent',
    prompt: 'What documents are acceptable for right to rent checks?',
    title: 'Question about right to rent?',
  },
  // EPC
  'uk-epc-guide': {
    topic: 'epc',
    prompt: 'What EPC rating is required to let a property?',
    title: 'Question about EPC rules?',
  },
  // EICR / Electrical safety
  'uk-electrical-safety-landlords': {
    topic: 'eicr',
    prompt: 'Do landlords need an EICR and how often?',
    title: 'Question about electrical safety?',
  },
};

function getComplianceTopicForPost(slug: string): { topic: AskHeavenTopic; prompt: string; title: string } | null {
  return COMPLIANCE_TOPIC_MAP[slug] || null;
}

const MAX_RELATED_GUIDES = 12;

const getRelatedGuides = (post: BlogPost) => {
  const normalizedTags = new Set(post.tags.map((tag) => tag.toLowerCase()));
  const candidates = blogPosts.filter((candidate) => candidate.slug !== post.slug);

  const matchesTopic = (candidate: BlogPost) => {
    const categoryMatch = candidate.category === post.category;
    const tagMatch = candidate.tags.some((tag) => normalizedTags.has(tag.toLowerCase()));
    return categoryMatch || tagMatch;
  };

  const getDateValue = (candidate: BlogPost) => {
    const dateValue = candidate.updatedDate ?? candidate.date;
    return new Date(dateValue).getTime();
  };

  const relatedByTopic = candidates
    .filter(matchesTopic)
    .map((candidate) => {
      const tagMatchCount = candidate.tags.filter((tag) => normalizedTags.has(tag.toLowerCase())).length;
      return {
        candidate,
        categoryMatch: candidate.category === post.category,
        tagMatchCount,
        dateValue: getDateValue(candidate),
      };
    })
    .sort((a, b) => {
      if (a.categoryMatch !== b.categoryMatch) {
        return a.categoryMatch ? -1 : 1;
      }
      if (a.tagMatchCount !== b.tagMatchCount) {
        return b.tagMatchCount - a.tagMatchCount;
      }
      if (a.dateValue !== b.dateValue) {
        return b.dateValue - a.dateValue;
      }
      return a.candidate.slug.localeCompare(b.candidate.slug);
    })
    .map(({ candidate }) => candidate);

  const relatedSlugs = new Set(relatedByTopic.map((candidate) => candidate.slug));
  const remaining = candidates
    .filter((candidate) => !relatedSlugs.has(candidate.slug))
    .sort((a, b) => {
      const dateDiff = getDateValue(b) - getDateValue(a);
      if (dateDiff !== 0) {
        return dateDiff;
      }
      return a.slug.localeCompare(b.slug);
    });

  return [...relatedByTopic, ...remaining].slice(0, MAX_RELATED_GUIDES).map((candidate) => ({
    slug: candidate.slug,
    title: candidate.title,
    description: candidate.description,
    date: candidate.date,
    readTime: candidate.readTime,
    category: candidate.category,
    heroImage: candidate.heroImage,
    heroImageAlt: candidate.heroImageAlt,
  }));
};

export async function generateStaticParams() {
  // Include both category pages and blog posts
  const categoryParams = getValidRegions().map((region) => ({
    slug: region,
  }));

  const postParams = blogPosts.map((post) => ({
    slug: post.slug,
  }));

  return [...categoryParams, ...postParams];
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Check if this is a category page
  if (isValidCategory(slug)) {
    const config = getCategoryConfig(slug);
    if (!config) {
      return { title: 'Category Not Found' };
    }

    const canonicalUrl = getCanonicalUrl(`/blog/${slug}`);

    return {
      title: config.title,
      description: config.metaDescription,
      keywords: config.relatedTopics,
      robots: 'index,follow',
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${config.title} | Landlord Heaven`,
        description: config.metaDescription,
        type: 'website',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: config.title,
        description: config.metaDescription,
      },
    };
  }

  // Otherwise, it's a blog post
  const post = getBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  // Truncate title to fit within 70 characters for SEO
  // Layout template adds "| Landlord Heaven" (18 chars), so max title length is 52
  const maxTitleLength = 52;
  const truncatedTitle = post.title.length > maxTitleLength
    ? post.title.substring(0, maxTitleLength - 3) + '...'
    : post.title;
  const canonicalUrl = getCanonicalUrl(`/blog/${slug}`);

  return {
    title: truncatedTitle, // Layout template adds "| Landlord Heaven"
    description: post.metaDescription,
    keywords: [post.targetKeyword, ...post.secondaryKeywords],
    robots: 'index,follow',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      url: canonicalUrl,
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

export default async function BlogSlugPage({ params }: BlogPageProps) {
  const { slug } = await params;

  // Check if this is a category page
  if (isValidCategory(slug)) {
    const config = getCategoryConfig(slug);
    if (!config) {
      notFound();
    }

    // Get posts for this region
    const posts = getPostsByRegion(blogPosts, slug);
    const postsForDisplay = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      readTime: post.readTime,
      category: post.category,
      heroImage: post.heroImage,
      heroImageAlt: post.heroImageAlt,
    }));

    return <CategoryPage region={slug} posts={postsForDisplay} />;
  }

  // Otherwise, it's a blog post
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedGuides = getRelatedGuides(post);
  const complianceTopic = getComplianceTopicForPost(slug);

  // Determine the region for breadcrumb
  const postRegion = getPostRegion(slug);
  const regionConfig = postRegion ? BLOG_CATEGORIES[postRegion] : null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.heroImage || `${SITE_ORIGIN}/og-image.png`,
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
      url: SITE_ORIGIN,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_ORIGIN}/blog/${slug}`,
    },
    wordCount: post.wordCount,
    keywords: [post.targetKeyword, ...post.secondaryKeywords].join(', '),
    ...(post.reviewer && {
      reviewedBy: {
        '@type': 'Person',
        name: post.reviewer.name,
        jobTitle: post.reviewer.role,
      },
    }),
  };

  // Build breadcrumb items - include category if post belongs to a region
  const breadcrumbItems = [
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
  ];

  if (regionConfig) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: `${regionConfig.name} Guides`,
      item: `${SITE_ORIGIN}/blog/${postRegion}`,
    });
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 4,
      name: post.title,
      item: `${SITE_ORIGIN}/blog/${slug}`,
    });
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: `${SITE_ORIGIN}/blog/${slug}`,
    });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
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
        {/* Hero Section - matches homepage pastel gradient */}
        <header className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-primary transition-colors">Landlord Guides</Link>
              {regionConfig && (
                <>
                  <span>/</span>
                  <Link href={`/blog/${postRegion}`} className="hover:text-primary transition-colors">
                    {regionConfig.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-gray-900 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <div className="max-w-4xl">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                <span className="bg-primary text-white px-3 py-1 rounded-full font-medium">
                  {post.category}
                </span>
                {regionConfig && (
                  <Link
                    href={`/blog/${postRegion}`}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium hover:bg-gray-200 transition-colors"
                  >
                    {regionConfig.name}
                  </Link>
                )}
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                {post.updatedDate && post.updatedDate !== post.date && (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Updated {new Date(post.updatedDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              {/* Reviewer badge if available */}
              {post.reviewer && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">
                    Reviewed by <span className="font-medium text-gray-900">{post.reviewer.name}</span>
                    {post.reviewer.role && <span className="text-gray-500"> ({post.reviewer.role})</span>}
                  </span>
                </div>
              )}

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
                <Link href="/products/notice-only" className="text-white underline hover:no-underline font-medium">
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

              {/* Sources Section */}
              {post.sources && post.sources.length > 0 && (
                <Sources sources={post.sources} />
              )}

              {/* Next Steps CTA */}
              <NextSteps slug={slug} category={post.category} tags={post.tags} />

              {/* Bottom CTA */}
              <BlogCTA variant="default" />

              {/* Ask Heaven Widget (mobile-visible) */}
              <div className="mt-8 lg:hidden">
                <AskHeavenWidget
                  variant="card"
                  source="blog"
                  topic={complianceTopic?.topic ?? 'general'}
                  prompt={complianceTopic?.prompt}
                  title={complianceTopic?.title ?? 'Have a landlord question?'}
                  utm_campaign={slug}
                />
              </div>

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
                    Get Section 21 — £39.99
                  </Link>
                </div>

                {/* Ask Heaven Widget */}
                <AskHeavenWidget
                  variant="compact"
                  source="blog"
                  topic={complianceTopic?.topic ?? 'general'}
                  prompt={complianceTopic?.prompt}
                  title={complianceTopic?.title ?? 'Have a landlord question?'}
                  utm_campaign={slug}
                />
              </div>
            </aside>
          </div>
        </div>

        {/* Related Posts */}
        {relatedGuides.length > 0 && <RelatedGuidesCarousel guides={relatedGuides} />}
      </article>
    </>
  );
}
