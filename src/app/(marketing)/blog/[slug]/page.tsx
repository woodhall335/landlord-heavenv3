import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/lib/seo/structured-data';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { AuthorBox } from '@/components/blog/AuthorBox';
import { RelatedGuidesCarousel } from '@/components/blog/RelatedGuidesCarousel';
import { Sources } from '@/components/blog/Sources';
import { BlogCard } from '@/components/blog/BlogCard';
import { CategoryPage } from '@/components/blog/CategoryPage';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';
import { blogPosts, getBlogPost } from '@/lib/blog/posts';
import { BlogPost } from '@/lib/blog/types';
import {
  getPostRegion,
  getPostsByRegion,
  getValidRegions,
  getCategoryConfig,
  BLOG_CATEGORIES,
  getPublicBlogRegions,
  isPublicBlogDiscoveryRegion,
  isPublicBlogRegion,
  BlogRegion,
} from '@/lib/blog/categories';
import { Calendar, Clock, Tag, ChevronLeft, Share2, RefreshCw, CheckCircle } from 'lucide-react';
import {
  buildBrandedTitle,
  getCanonicalUrl,
  normalizeKeywordList,
  sanitizePageTitle,
  SITE_ORIGIN,
} from '@/lib/seo';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import { BlogAskHeavenPanel } from '@/components/blog/BlogAskHeavenPanel';
import type { AskHeavenTopic } from '@/lib/ask-heaven/buildAskHeavenLink';
import { FAQInline } from '@/components/seo/FAQSection';
import Image from 'next/image';
import { BlogReadingProgress } from '@/components/blog/BlogReadingProgress';
import { BlogBackToTop } from '@/components/blog/BlogBackToTop';
import { BlogStickySlots } from '@/components/blog/BlogStickySlots';
import { BlogProse } from '@/components/blog/BlogProse';
import { BlogCtaProvider } from '@/components/blog/BlogCtaContext';
import { BlogArticleStickyGuard } from '@/components/blog/BlogArticleStickyGuard';
import { NextSteps } from '@/components/blog/NextSteps';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { MoneyClaimBridge } from '@/components/marketing/CommercialBridge';
import { getBlogImagesForPost, getBlogImagesForPostThumb } from '@/lib/blog/image-manifest';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import { getBlogPostManualSeoKeywords } from '@/lib/blog/manual-seo-keywords';
import { getBlogProductCta } from '@/lib/blog/product-cta-map';
import {
  getPostsForTopicHub,
  getPublicTopicHubs,
  getTopicHubConfig,
  getValidTopicHubs,
  isPublicTopicHub,
} from '@/lib/blog/topic-hubs';
import { getImagePlaceholderBlocks, getIntentRoutedLinks, getTop30QuickAnswer, getTop30Rank, getTop30SupplementalFaqs, getUpgradedPostVariant, isTop30UpgradedPost } from '@/lib/blog/top30-upgrades';
import type { CSSProperties, ReactNode } from 'react';
import { isValidElement } from 'react';
import type { AssistedPrepService } from '@/lib/assisted-prep';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

// Check if a slug is a valid category/region
function isValidCategory(slug: string): slug is BlogRegion {
  return getValidRegions().includes(slug as BlogRegion);
}

function isValidTopicHubSlug(slug: string): boolean {
  return getValidTopicHubs().includes(slug as any);
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

function getAssistedServiceForBlogPost(post: BlogPost): AssistedPrepService | null {
  const haystack = [post.slug, post.title, post.category, ...(post.tags || [])].join(' ').toLowerCase();
  if (haystack.includes('money claim') || haystack.includes('debt') || haystack.includes('arrears after')) {
    return 'money_claim';
  }
  if (haystack.includes('n5') || haystack.includes('n119') || haystack.includes('court') || haystack.includes('possession claim')) {
    return 'possession';
  }
  if (haystack.includes('section 8') || haystack.includes('form 3a') || haystack.includes('eviction') || haystack.includes('ground')) {
    return 'section8';
  }
  return null;
}

function getComplianceTopicForPost(slug: string): { topic: AskHeavenTopic; prompt: string; title: string } | null {
  return COMPLIANCE_TOPIC_MAP[slug] || null;
}

const MAX_RELATED_GUIDES = 12;
const BLOG_STICKY_TOP_OFFSET = '7rem';


const CORE_EVICTION_GUIDES = [
  { href: '/products/notice-only', label: 'Eviction notice pack for landlords' },
  { href: '/section-8-notice', label: 'Section 8 notice guide' },
  { href: '/how-to-evict-a-tenant-england', label: 'How to evict a tenant in England' },
  { href: '/evict-tenant-not-paying-rent', label: 'Evicting a tenant not paying rent' },
  { href: '/tenant-stopped-paying-rent', label: 'Tenant stopped paying rent playbook' },
] as const;

function extractTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextContent).join(' ').replace(/\s+/g, ' ').trim();
  }

  if (isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: ReactNode }>;
    return extractTextContent(element.props.children);
  }

  return '';
}

function collectFaqCandidateBlocks(
  node: ReactNode,
  blocks: Array<{ type: 'h3' | 'p'; text: string }>
): void {
  if (Array.isArray(node)) {
    node.forEach((child) => collectFaqCandidateBlocks(child, blocks));
    return;
  }

  if (!isValidElement(node)) {
    return;
  }

  const element = node as React.ReactElement<{ children?: ReactNode }>;

  if (element.type === 'h3' || element.type === 'p') {
    const text = extractTextContent(element.props.children);
    if (text.trim()) {
      blocks.push({ type: element.type, text: text.trim() });
    }
  }

  collectFaqCandidateBlocks(element.props.children, blocks);
}

function extractFaqsFromContent(content: ReactNode): Array<{ question: string; answer: string }> {
  const blocks: Array<{ type: 'h3' | 'p'; text: string }> = [];
  collectFaqCandidateBlocks(content, blocks);

  const extracted: Array<{ question: string; answer: string }> = [];

  for (let index = 0; index < blocks.length - 1; index += 1) {
    const current = blocks[index];
    const next = blocks[index + 1];

    if (current.type !== 'h3' || next.type !== 'p') {
      continue;
    }

    if (!current.text.endsWith('?')) {
      continue;
    }

    extracted.push({
      question: current.text,
      answer: next.text,
    });
  }

  return extracted;
}


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
    heroImage: getBlogImagesForPostThumb({
      slug: candidate.slug,
      title: candidate.title,
      targetKeyword: candidate.targetKeyword,
      category: candidate.category,
      tags: candidate.tags,
    }).hero,
    heroImageAlt: candidate.heroImageAlt,
  }));
};

export async function generateStaticParams() {
  // Include both category pages and blog posts
  const categoryParams = getPublicBlogRegions().map((region) => ({
    slug: region,
  }));

  const topicHubParams = getPublicTopicHubs().map((hub) => ({
    slug: hub,
  }));

  const postParams = blogPosts.map((post) => ({
    slug: post.slug,
  }));

  return [...categoryParams, ...topicHubParams, ...postParams];
}

function buildBlogPostKeywords(post: BlogPost, seoConfig: ReturnType<typeof getBlogSeoConfig>): string[] {
  return normalizeKeywordList([
    ...getBlogPostManualSeoKeywords(post),
    post.targetKeyword,
    ...post.secondaryKeywords,
    post.title,
    seoConfig.metaTitle,
    `${post.targetKeyword} guide`,
    `${post.targetKeyword} landlords`,
    post.category,
    ...post.tags,
    seoConfig.pillarLink.label,
    ...seoConfig.supportingLinks.map((link) => link.label),
    seoConfig.primaryCommercialLink.anchorText,
  ]).slice(0, 12);
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
    const pageTitle = sanitizePageTitle(config.title);
    const socialTitle = buildBrandedTitle(pageTitle);
    const keywords = normalizeKeywordList([
      config.name,
      config.title,
      ...config.relatedTopics,
      `${config.name} landlord guide`,
      `${config.name} landlord documents`,
      `${config.name} eviction guidance`,
      `${config.name} tenancy guidance`,
      `${config.name} rent arrears guidance`,
    ]).slice(0, 12);

    return {
      title: pageTitle,
      description: config.metaDescription,
      keywords,
      robots: isPublicBlogRegion(slug) ? 'index,follow' : 'noindex,follow',
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: socialTitle,
        description: config.metaDescription,
        type: 'website',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: socialTitle,
        description: config.metaDescription,
      },
    };
  }

  const topicHub = getTopicHubConfig(slug);
  if (topicHub) {
    const canonicalUrl = getCanonicalUrl(`/blog/${slug}`);
    const pageTitle = sanitizePageTitle(topicHub.title);
    const socialTitle = buildBrandedTitle(pageTitle);
    const keywords = normalizeKeywordList([
      topicHub.name,
      pageTitle,
      topicHub.title,
      `${topicHub.name} landlord guide`,
      `${topicHub.name} landlord documents`,
      `${topicHub.name} templates`,
      `${topicHub.name} checklist`,
      `${topicHub.name} England`,
      `${topicHub.name} UK landlords`,
      topicHub.metaDescription,
    ]).slice(0, 12);

    return {
      title: pageTitle,
      description: topicHub.metaDescription,
      keywords,
      robots: isPublicTopicHub(slug) ? 'index,follow' : 'noindex,follow',
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: socialTitle,
        description: topicHub.metaDescription,
        type: 'website',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: socialTitle,
        description: topicHub.metaDescription,
      },
    };
  }


  // Otherwise, it's a blog post
  const basePost = getBlogPost(slug);

  if (!basePost) {
    return { title: 'Post Not Found' };
  }

  const post = getUpgradedPostVariant(basePost);
  const postRegion = getPostRegion(slug);
  const seoConfig = getBlogSeoConfig(post, postRegion);
  const manifestImages = getBlogImagesForPost({
    slug: post.slug,
    title: post.title,
    targetKeyword: post.targetKeyword,
    category: post.category,
    tags: post.tags,
  });
  // Use canonicalSlug if this post points to another as the canonical version
  const canonicalUrl = getCanonicalUrl(seoConfig.canonicalPath);
  const pageTitle = sanitizePageTitle(seoConfig.metaTitle);
  const socialTitle = buildBrandedTitle(pageTitle);
  const keywords = buildBlogPostKeywords(post, seoConfig);

  return {
    title: pageTitle,
    description: seoConfig.metaDescription,
    keywords,
    robots: seoConfig.robots,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: socialTitle,
      description: seoConfig.metaDescription,
      type: 'article',
      url: canonicalUrl,
      publishedTime: post.date,
      modifiedTime: post.updatedDate || post.date,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: manifestImages.og || '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.heroImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: seoConfig.metaDescription,
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
      heroImage: getBlogImagesForPostThumb({
        slug: post.slug,
        title: post.title,
        targetKeyword: post.targetKeyword,
        category: post.category,
        tags: post.tags,
      }).hero,
      heroImageAlt: post.heroImageAlt,
    }));

    return <CategoryPage region={slug} posts={postsForDisplay} />;
  }

  const topicHub = getTopicHubConfig(slug);
  if (topicHub && isValidTopicHubSlug(slug)) {
    const topicHubPosts = getPostsForTopicHub(blogPosts, topicHub.slug);
    const posts = (isPublicTopicHub(slug)
      ? topicHubPosts.filter((post) => isPublicBlogDiscoveryRegion(getPostRegion(post.slug)))
      : topicHubPosts
    )
      .sort((a, b) => getTop30Rank(a.slug) - getTop30Rank(b.slug))
      .slice(0, 36);
    const postsForDisplay = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      readTime: post.readTime,
      category: post.category,
      heroImage: getBlogImagesForPostThumb({
        slug: post.slug,
        title: post.title,
        targetKeyword: post.targetKeyword,
        category: post.category,
        tags: post.tags,
      }).hero,
      heroImageAlt: post.heroImageAlt,
    }));

    return (
      <main className="bg-white pb-16"> 
        <section className="border-b border-[#ede2ff] bg-[linear-gradient(180deg,#ffffff_0%,#f8f1ff_100%)] py-10 lg:py-14"> 
          <div className="container mx-auto px-4"> 
            <Link href="/blog" className="text-sm font-medium text-primary hover:underline"> 
              ← Back to blog
            </Link>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">{topicHub.name}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{topicHub.intro}</p>
            <StaggerReveal className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"> 
              {topicHub.pillarLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl border border-[#e3d3ff] bg-white px-4 py-3 text-sm font-semibold text-[#692ed4] shadow-sm transition hover:border-[#c6a2ff] standalone-premium-hover-lift"> 
                  {link.label}
                </Link>
              ))}
            </StaggerReveal>
          </div>
        </section>

          <section className="container mx-auto px-4 py-10 lg:py-14"> 
            <h2 className="text-2xl font-bold text-gray-900">Related posts in this topic</h2>
            <p className="mb-8 mt-2 text-gray-600">{topicHub.description}</p>
          <StaggerReveal className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"> 
            {postsForDisplay.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </StaggerReveal>
        </section>
      </main>
    );
  }

  // Otherwise, it's a blog post
  const basePost = getBlogPost(slug);

  if (!basePost) {
    notFound();
  }

  const post = getUpgradedPostVariant(basePost);

  const relatedGuides = getRelatedGuides(post);
  const complianceTopic = getComplianceTopicForPost(slug);

  // Determine the region for breadcrumb
  const postRegion = getPostRegion(slug);
  const regionConfig = postRegion ? BLOG_CATEGORIES[postRegion] : null;

  // Analyze post for commercial linking (automated CTAs to core product pages)
  const seoConfig = getBlogSeoConfig(post, postRegion);
  const manifestImages = getBlogImagesForPost({
    slug: post.slug,
    title: post.title,
    targetKeyword: post.targetKeyword,
    category: post.category,
    tags: post.tags,
  });
  const heroSrc = manifestImages.hero || post.heroImage;
  const productCta = getBlogProductCta(post);
  const assistedService = getAssistedServiceForBlogPost(post);
  const extractedFaqs = extractFaqsFromContent(post.content);
  const resolvedFaqs = [
    ...(post.faqs ?? []),
    ...extractedFaqs,
    ...getTop30SupplementalFaqs(post),
  ];
  const sanitizedFaqs = resolvedFaqs
    .filter((faq) => faq.question.trim().length > 0 && faq.answer.trim().length > 0)
    .filter((faq, index, arr) => arr.findIndex((candidate) => candidate.question.trim().toLowerCase() === faq.question.trim().toLowerCase()) === index);

  const quickAnswer = getTop30QuickAnswer(post);
  const intentLinks = getIntentRoutedLinks(post.slug);
  const imagePlaceholders = getImagePlaceholderBlocks(post.slug);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: seoConfig.metaTitle,
    description: seoConfig.metaDescription,
    image: `${SITE_ORIGIN}${manifestImages.og || post.heroImage || '/og-image.png'}`,
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
    keywords: getBlogPostManualSeoKeywords(post).join(', '),
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
      name: seoConfig.metaTitle,
      item: `${SITE_ORIGIN}/blog/${slug}`,
    });
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: seoConfig.metaTitle,
      item: `${SITE_ORIGIN}/blog/${slug}`,
    });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  // FAQ Schema for rich snippets (only if post has FAQs)
  const faqSchema = sanitizedFaqs.length >= 3 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: sanitizedFaqs.map((faq) => ({
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

      <article className="min-h-screen" style={{ '--lh-sticky-top': BLOG_STICKY_TOP_OFFSET } as CSSProperties}>
        <BlogArticleStickyGuard />
        <UniversalHero
          id="blog-hero"
          preset="product_owner"
          title={seoConfig.metaTitle}
          subtitle={seoConfig.heroIntro}
          hideMedia
          align="left"
          trustText={`${post.category} landlord guide`}
          ariaLabel={`${seoConfig.metaTitle} hero`}
          showUsageCounter={false}
        >
          <div className="mt-6 max-w-4xl space-y-4 text-left">
            <nav className="flex flex-wrap items-center gap-1.5 text-xs text-white/70 sm:text-sm">
              <Link href="/" className="text-white/80 transition-colors hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/blog" className="text-white/80 transition-colors hover:text-white">Landlord Guides</Link>
              {regionConfig && (
                <>
                  <span>/</span>
                  <Link href={`/blog/${postRegion}`} className="text-white/80 transition-colors hover:text-white">
                    {regionConfig.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="max-w-[220px] truncate text-white">{seoConfig.metaTitle}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
              <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 font-medium text-white">
                {post.category}
              </span>
              {regionConfig && (
                <Link
                  href={`/blog/${postRegion}`}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white transition-colors hover:bg-white/20"
                >
                  {regionConfig.name}
                </Link>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              {post.updatedDate && post.updatedDate !== post.date && (
                <span className="flex items-center gap-1.5 font-medium text-emerald-100">
                  <RefreshCw className="w-4 h-4" />
                  Updated: {new Date(post.updatedDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-white">Landlord guide</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/85">{post.author.role}</span>
            </div>

            {post.reviewer && (
              <div className="flex items-center gap-2 text-sm text-white/80">
                <CheckCircle className="w-4 h-4 text-emerald-100" />
                <span>
                  Reviewed: <span className="font-medium text-white">{post.reviewer.name}</span>
                  {post.reviewer.role && <span className="text-white/70"> ({post.reviewer.role})</span>}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/85"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-sm backdrop-blur-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                What this guide will help with
              </p>
              <p className="mt-2 text-sm text-white/85">
                For landlords searching for {post.targetKeyword}, this guide gives the short answer first,
                explains the evidence or compliance checks, and points you toward the next sensible
                document, tool, or guide.
              </p>
            </div>
          </div>
        </UniversalHero>

        {/* Urgency Banner (for S21 posts) */}
        {post.showUrgencyBanner && (
          <div className="bg-primary text-white py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                <span className="font-semibold">Section 21 ends 1 May 2026 —</span>
                <span className="text-white font-bold">We are aligned with the Renters' Rights Act.</span>
                <Link href="/renters-rights-act-eviction-rules" className="text-white underline hover:no-underline font-medium">
                  See the current rules
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto min-w-0 px-4 py-7 lg:py-9">
          <BlogReadingProgress />
          <Reveal className="blog-full-bleed-hero-wrapper relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#e8ddfb] bg-[#f8f1ff] shadow-[0_18px_50px_rgba(105,46,212,0.12)] lg:mb-10">
            <Image
              src={heroSrc}
              alt={post.heroImageAlt}
              fill
              sizes="(min-width: 1280px) 1120px, 100vw"
              className="object-cover object-center"
            />
          </Reveal>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,760px)_300px] lg:gap-12 lg:justify-center">
            {/* Main Content */}
            <div className="min-w-0 max-w-[760px] overflow-x-clip pb-20 lg:pb-0">
              <AuthorBox
                name={post.author.name}
                role={post.author.role}
                image={post.author.image}
              />

              {quickAnswer && (
                <Reveal as="section" className="mt-8 rounded-2xl border border-[#e9dcff] bg-white p-5 shadow-[0_14px_34px_rgba(105,46,212,0.08)] md:p-6" aria-label="Quick answer">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Short answer</p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">{quickAnswer.question}</h2>
                  <p className="mt-3 text-sm text-gray-700">{quickAnswer.answer}</p>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                    {quickAnswer.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </Reveal>
              )}

              <Reveal as="section" className="mt-8 rounded-2xl border border-[#e9dcff] bg-[#fbf8ff] p-5 shadow-[0_14px_34px_rgba(105,46,212,0.08)] md:p-6" aria-label="Use this guide when">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Use this guide when</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">You need a practical landlord answer, not just a definition</h2>
                <p className="mt-3 text-sm leading-7 text-gray-700">
                  Use this page when you need to understand {post.targetKeyword} in landlord terms, check
                  the evidence or compliance points that matter, and decide whether the next step is a guide,
                  free tool, notice pack, court pack, tenancy agreement, rent increase pack, or money claim route.
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-700">
                  The useful SEO value here is the visible explanation, examples, FAQs, and internal links,
                  not the hidden meta keywords.
                </p>
              </Reveal>

              {isTop30UpgradedPost(post.slug) && (
                <Reveal as="section" className="mt-8 rounded-2xl border border-[#e9dcff] bg-[#f8f1ff] p-5 shadow-[0_14px_34px_rgba(105,46,212,0.08)] md:p-6" aria-label="Recommended next routes">
                  <h2 className="text-xl font-bold text-gray-900">Pick the next step that fits your case</h2>
                  <p className="mt-2 text-sm text-gray-700">Use the option below that matches where you are now, so you do not waste time on the wrong paperwork.</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {intentLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="font-medium text-primary hover:underline">{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              <BlogCtaProvider value={{ cta: productCta, postSlug: slug, category: post.category }}>
                {slug === 'england-money-claim-online' ? (
                  <MoneyClaimBridge
                    sourcePage="/blog/england-money-claim-online"
                    ctaPosition="top"
                    headline="Turn arrears into a clear money claim"
                  />
                ) : null}
                <BlogProse
                  post={post}
                  cta={productCta}
                  postSlug={slug}
                  category={post.category}
                >
                  {post.content}
                </BlogProse>
              </BlogCtaProvider>

              {assistedService ? (
                <AssistedPrepServicesShowcase
                  pagePath={`/blog/${slug}`}
                  pageType="guide"
                  src="blog_assisted_cta"
                />
              ) : null}

              <NextSteps slug={post.slug} category={post.category} tags={post.tags} />

              <Reveal as="section" className="mt-10 rounded-2xl border border-[#e9dcff] bg-[#f8f1ff] p-5 shadow-[0_14px_34px_rgba(105,46,212,0.08)] md:p-6" aria-label="Core eviction guides">
                <h2 className="text-xl font-bold text-gray-900">Core eviction guides landlords usually need next</h2>
                <p className="mt-2 text-sm text-gray-700">
                  These are the core possession guides landlords usually need after notice or arrears problems start.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {CORE_EVICTION_GUIDES.map((guide) => (
                    <li key={guide.href}>
                      <Link href={guide.href} className="font-medium text-primary hover:underline">
                        {guide.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {imagePlaceholders.length > 0 && (
                <section className="mt-12 rounded-2xl border border-dashed border-[#bba0ee] bg-white p-5 md:p-6" aria-label="Image and diagram placeholders">
                  <h2 className="text-2xl font-bold text-gray-900">Visuals to insert in next content sprint</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {imagePlaceholders.map((block) => (
                      <div key={block.title} className="rounded-xl border border-[#e9dcff] bg-[#faf7ff] p-4">
                        <h3 className="font-semibold text-gray-900">{block.title}</h3>
                        <p className="mt-2 text-sm text-gray-700">{block.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {sanitizedFaqs.length > 0 && (
                <Reveal as="section" className="mt-12 rounded-2xl border border-[#e9dcff] bg-[#f8f1ff] p-5 shadow-[0_14px_34px_rgba(105,46,212,0.08)] md:p-6" aria-label="FAQs for landlords">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQs for landlords</h2>
                  <FAQInline faqs={sanitizedFaqs} className="rounded-2xl border border-[#e7d9ff] bg-white p-5 md:p-6" />
                </Reveal>
              )}

              {post.sources && post.sources.length > 0 && (
                <Sources sources={post.sources} />
              )}

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

              <div className="mt-12 flex items-center justify-between border-t border-gray-100 py-7">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-gray-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to all guides
                </Link>
                <button className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <aside
              className="hidden min-w-0 lg:sticky lg:top-[var(--lh-sticky-top)] lg:block lg:self-start"
              aria-label="Article navigation"
              data-blog-sidebar
              data-blog-sticky-inner
            >
              <div className="space-y-3">
                <TableOfContents items={post.tableOfContents} />
                <BlogStickySlots cta={productCta} postSlug={slug} category={post.category} showDesktop showMobile={false} />
                <BlogAskHeavenPanel
                  topic={complianceTopic?.topic ?? 'general'}
                  prompt={complianceTopic?.prompt}
                  title={complianceTopic?.title ?? 'Have a landlord question?'}
                  slug={slug}
                />
              </div>
            </aside>
          </div>
          <BlogStickySlots cta={productCta} postSlug={slug} category={post.category} showDesktop={false} showMobile />
          <BlogBackToTop />
        </div>

        {/* Related Posts */}
        {relatedGuides.length > 0 && <RelatedGuidesCarousel guides={relatedGuides} postSlug={slug} category={post.category} />}
      </article>
    </>
  );
}

