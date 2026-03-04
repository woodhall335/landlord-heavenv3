import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/lib/seo/structured-data';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { AuthorBox } from '@/components/blog/AuthorBox';
import { RelatedGuidesCarousel } from '@/components/blog/RelatedGuidesCarousel';
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
import { FAQInline } from '@/components/seo/FAQSection';
import { landingPageLinks, productLinks, guideLinks } from '@/lib/seo/internal-links';
import Image from 'next/image';
import { BlogReadingProgress } from '@/components/blog/BlogReadingProgress';
import { BlogInlineProductCard } from '@/components/blog/BlogInlineProductCard';
import { BlogBackToTop } from '@/components/blog/BlogBackToTop';
import { BlogStickySlots } from '@/components/blog/BlogStickySlots';
import { BlogProse } from '@/components/blog/BlogProse';
import { LegalDisclaimer } from '@/components/blog/BlogCallout';
import { getBlogImagesForPost, getBlogImagesForPostThumb } from '@/lib/blog/image-manifest';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import { BLOG_PRODUCT_ROUTES, getBlogProductCta } from '@/lib/blog/product-cta-map';
import type { StageEstimate } from '@/lib/journey/state';
import type { CSSProperties } from 'react';

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
const BLOG_STICKY_TOP_OFFSET = '7rem';


function inferBlogStageHint(post: BlogPost): StageEstimate {
  const haystack = `${post.title} ${post.targetKeyword} ${post.tags.join(' ')}`.toLowerCase();

  if (['n5', 'n5b', 'court', 'hearing', 'bailiff', 'warrant'].some((keyword) => haystack.includes(keyword))) {
    return 'court_ready';
  }

  if (
    ['serving notice', 'eviction notice', 'proof of service', 'section 8', 'section 21', 'notice to leave'].some(
      (keyword) => haystack.includes(keyword),
    )
  ) {
    return 'notice_ready';
  }

  if (['demand letter', 'letter before action', 'arrears letter'].some((keyword) => haystack.includes(keyword))) {
    return 'demand_sent';
  }

  if (['arrears', 'late rent', 'missed payment'].some((keyword) => haystack.includes(keyword))) {
    return 'early_arrears';
  }

  return 'unknown';
}


const buildNextLegalSteps = (post: BlogPost, region: BlogRegion | null) => {
  const target = post.targetKeyword.toLowerCase();
  const tags = post.tags.map((tag) => tag.toLowerCase());

  const isMoneyClaim =
    target.includes('money claim') ||
    target.includes('rent arrears') ||
    tags.some((tag) => tag.includes('arrears') || tag.includes('money claim'));

  const isTenancy =
    target.includes('tenancy') ||
    target.includes('ast') ||
    target.includes('prt') ||
    tags.some((tag) => tag.includes('tenancy') || tag.includes('agreement'));

  const isEviction = !isMoneyClaim && !isTenancy;

  const jurisdictionName = region
    ? region === 'northern-ireland'
      ? 'Northern Ireland'
      : region.charAt(0).toUpperCase() + region.slice(1)
    : 'UK';

  if (isMoneyClaim) {
    if (region === 'northern-ireland') {
      return {
        jurisdictionLabel: `${jurisdictionName} rent arrears`,
        scenarioLabel: 'recovering unpaid rent',
        primaryCTA: {
          label: 'Download rent arrears letter',
          href: landingPageLinks.rentArrearsTemplate.href,
        },
        secondaryCTA: {
          label: 'Calculate arrears + interest',
          href: '/tools/rent-arrears-calculator',
        },
        relatedLinks: [
          {
            href: landingPageLinks.rentArrearsTemplate.href,
            title: landingPageLinks.rentArrearsTemplate.title,
            description: landingPageLinks.rentArrearsTemplate.description,
          },
          {
            href: '/blog/northern-ireland-private-tenancies-order',
            title: 'NI private tenancies order',
            description: 'Compliance steps before taking court action.',
          },
        ],
      };
    }

    return {
      jurisdictionLabel: `${jurisdictionName} rent arrears`,
      scenarioLabel: 'recovering unpaid rent',
      primaryCTA: {
        label: 'Start the Money Claim Pack',
        href: productLinks.moneyClaim.href,
      },
      secondaryCTA: {
        label: 'Calculate arrears + interest',
        href: '/tools/rent-arrears-calculator',
      },
      relatedLinks: [
        {
          href: landingPageLinks.rentArrearsTemplate.href,
          title: landingPageLinks.rentArrearsTemplate.title,
          description: landingPageLinks.rentArrearsTemplate.description,
        },
        {
          href: '/money-claim-unpaid-rent',
          title: 'Money claim guide',
          description: 'Court routes, costs, and timelines for arrears claims.',
        },
      ],
    };
  }

  if (isTenancy) {
    const tenancyLink =
      region === 'scotland'
        ? '/private-residential-tenancy-agreement-template'
        : region === 'wales'
        ? '/wales-tenancy-agreement-template'
        : region === 'northern-ireland'
        ? '/northern-ireland-tenancy-agreement-template'
        : '/assured-shorthold-tenancy-agreement-template';

    return {
      jurisdictionLabel: `${jurisdictionName} tenancy agreements`,
      scenarioLabel: 'creating compliant tenancy agreements',
      primaryCTA: {
        label: 'Get the Tenancy Agreement Pack',
        href: '/products/ast',
      },
      secondaryCTA: {
        label: 'Download the template',
        href: tenancyLink,
      },
      relatedLinks: [
        {
          href: '/products/ast',
          title: 'Tenancy Agreement Pack',
          description: 'Standard and Premium agreements with compliance checks.',
        },
        {
          href: tenancyLink,
          title: `${jurisdictionName} tenancy agreement template`,
          description: 'Jurisdiction-specific tenancy requirements.',
        },
      ],
    };
  }

  if (isEviction) {
    if (region === 'northern-ireland') {
      return {
        jurisdictionLabel: `${jurisdictionName} tenancy agreements`,
        scenarioLabel: 'NI landlord compliance',
        primaryCTA: {
          label: 'Create NI tenancy agreement',
          href: '/northern-ireland-tenancy-agreement-template',
        },
        secondaryCTA: {
          label: 'Tenancy agreement templates',
          href: landingPageLinks.tenancyTemplate.href,
        },
        relatedLinks: [
          {
            href: '/northern-ireland-tenancy-agreement-template',
            title: 'Northern Ireland tenancy agreements',
            description: 'Private tenancy agreements for NI landlords.',
          },
          {
            href: '/blog/northern-ireland-private-tenancies-order',
            title: 'NI Private Tenancies Order guide',
            description: 'Key obligations and compliance steps in NI.',
          },
        ],
      };
    }

    const primaryRelated =
      region === 'wales'
        ? {
            href: guideLinks.walesEviction.href,
            title: guideLinks.walesEviction.title,
            description: 'Renting Homes Act notices and timelines.',
          }
        : region === 'scotland'
        ? {
            href: guideLinks.scotlandEviction.href,
            title: guideLinks.scotlandEviction.title,
            description: 'Notice to Leave and tribunal steps.',
          }
        : {
            href: landingPageLinks.evictionTemplate.href,
            title: landingPageLinks.evictionTemplate.title,
            description: landingPageLinks.evictionTemplate.description,
          };

    const secondaryRelated =
      region === 'wales'
        ? {
            href: '/blog/wales-notice-periods-landlords',
            title: 'Wales notice periods',
            description: 'Current notice periods under Welsh law.',
          }
        : region === 'scotland'
        ? {
            href: '/blog/scotland-notice-to-leave',
            title: 'Notice to Leave guide',
            description: 'Notice periods and prescribed content.',
          }
        : {
            href: landingPageLinks.section8Template.href,
            title: landingPageLinks.section8Template.title,
            description: landingPageLinks.section8Template.description,
          };

    return {
      jurisdictionLabel: `${jurisdictionName} eviction notices`,
      scenarioLabel: 'serving the correct notice',
      primaryCTA: {
        label: 'Generate an eviction notice',
        href: productLinks.noticeOnly.href,
      },
      secondaryCTA: {
        label: 'Get the Complete Eviction Pack',
        href: productLinks.completePack.href,
      },
      relatedLinks: [primaryRelated, secondaryRelated],
    };
  }

  return null;
};

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

  return {
    title: seoConfig.metaTitle, // Layout template adds "| Landlord Heaven"
    description: seoConfig.metaDescription,
    keywords: [post.targetKeyword, ...post.secondaryKeywords],
    robots: seoConfig.robots,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoConfig.metaTitle,
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
      title: seoConfig.metaTitle,
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
  const heroIsSvg = heroSrc.toLowerCase().endsWith('.svg');
  const productCta = getBlogProductCta(post);
  const sanitizedFaqs = (post.faqs ?? [])
    .filter((faq) => faq.question.trim().length > 0 && faq.answer.trim().length > 0)
    .filter((faq, index, arr) => arr.findIndex((candidate) => candidate.question.trim().toLowerCase() === faq.question.trim().toLowerCase()) === index);

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
        {/* Hero Section - matches homepage pastel gradient */}
        <header id="blog-hero" className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-6 pb-8 md:pt-8 md:pb-10">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
              <Link href="/" className="text-slate-600 transition-colors hover:text-[#692ed4]">Home</Link>
              <span>/</span>
              <Link href="/blog" className="text-slate-600 transition-colors hover:text-[#692ed4]">Landlord Guides</Link>
              {regionConfig && (
                <>
                  <span>/</span>
                  <Link href={`/blog/${postRegion}`} className="text-slate-600 transition-colors hover:text-[#692ed4]">
                    {regionConfig.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="max-w-[220px] truncate text-slate-900">{seoConfig.metaTitle}</span>
            </nav>

            <div className="max-w-4xl">
              {/* Category & Meta */}
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-[#692ed4] px-3 py-1 font-medium text-white">
                  {post.category}
                </span>
                {regionConfig && (
                  <Link
                    href={`/blog/${postRegion}`}
                    className="rounded-full border border-[#e3d3ff] bg-white px-3 py-1 font-medium text-gray-700 transition-colors hover:border-[#692ed4] hover:text-[#692ed4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
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
                    Updated: {new Date(post.updatedDate).toLocaleDateString('en-GB', {
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

              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <span className="rounded-full border border-[#e3d3ff] bg-[#f8f1ff] px-3 py-1 text-[#692ed4]">Court-ready guidance</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{post.author.role}</span>
              </div>

              {/* Reviewer badge if available */}
              {post.reviewer && (
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">
                    Reviewed: <span className="font-medium text-gray-900">{post.reviewer.name}</span>
                    {post.reviewer.role && <span className="text-gray-500"> ({post.reviewer.role})</span>}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="mb-3 text-balance break-words text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {seoConfig.metaTitle}
              </h1>

              {/* Description */}
              <p className="mb-5 max-w-3xl line-clamp-4 text-base leading-7 text-slate-600 md:line-clamp-3 sm:text-lg sm:leading-8">
                {seoConfig.heroIntro}
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
                <Link href={BLOG_PRODUCT_ROUTES.noticeOnly} className="text-white underline hover:no-underline font-medium">
                  Serve Your Notice Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <BlogReadingProgress />
          <div className="blog-full-bleed-hero-wrapper relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#e8ddfb] bg-[#f8f1ff] shadow-[0_10px_30px_rgba(105,46,212,0.08)] lg:mb-10">
            <Image
              src={heroSrc}
              alt={post.heroImageAlt}
              fill
              sizes="(min-width: 1280px) 1120px, 100vw"
              className={heroIsSvg ? 'object-contain p-2 sm:p-3' : 'object-cover object-center'}
            />
          </div>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,760px)_300px] lg:gap-14 lg:justify-center">
            {/* Main Content */}
            <div className="min-w-0 max-w-[760px] overflow-x-clip pb-20 lg:pb-0">
              <AuthorBox
                name={post.author.name}
                role={post.author.role}
                image={post.author.image}
              />

              <LegalDisclaimer>
                This guidance is informational and not legal advice. Consult a qualified legal professional for your case.
              </LegalDisclaimer>

              <BlogInlineProductCard cta={productCta} postSlug={slug} category={post.category} />

              <BlogProse>
                {post.content}
              </BlogProse>

              {sanitizedFaqs.length > 0 && (
                <section className="mt-14 rounded-2xl border border-[#e9dcff] bg-[#f8f1ff] p-6 shadow-sm" aria-label="Frequently asked questions">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <FAQInline faqs={sanitizedFaqs} className="rounded-2xl border border-[#e7d9ff] bg-white p-5 md:p-6" />
                </section>
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

              <div className="mt-14 flex items-center justify-between border-t border-gray-100 py-8">
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
            <aside className="hidden min-w-0 lg:block lg:self-start" aria-label="Article navigation">
              <div className="sticky top-[var(--lh-sticky-top)] space-y-4">
                <TableOfContents items={post.tableOfContents} />
                <BlogStickySlots cta={productCta} postSlug={slug} category={post.category} showDesktop showMobile={false} />
                <div className="rounded-2xl border border-[#e7d9ff] bg-[#f8f1ff] p-3 shadow-sm">
                  <AskHeavenWidget
                    variant="compact"
                    source="blog"
                    topic={complianceTopic?.topic ?? 'general'}
                    prompt={complianceTopic?.prompt}
                    title={complianceTopic?.title ?? 'Have a landlord question?'}
                    utm_campaign={slug}
                  />
                </div>
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
