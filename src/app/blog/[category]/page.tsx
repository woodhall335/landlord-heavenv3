import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryPage } from '@/components/blog/CategoryPage';
import { blogPosts } from '@/lib/blog/posts';
import {
  BlogRegion,
  getValidRegions,
  getCategoryConfig,
  getPostsByRegion,
} from '@/lib/blog/categories';
import { getCanonicalUrl } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Generate static params for all valid regions
export async function generateStaticParams() {
  return getValidRegions().map((region) => ({
    category: region,
  }));
}

// Generate metadata for the category page
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const config = getCategoryConfig(category as BlogRegion);

  if (!config) {
    return { title: 'Category Not Found' };
  }

  const canonicalUrl = getCanonicalUrl(`/blog/${category}`);

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

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Validate the category
  const validRegions = getValidRegions();
  if (!validRegions.includes(category as BlogRegion)) {
    notFound();
  }

  const region = category as BlogRegion;
  const config = getCategoryConfig(region);

  if (!config) {
    notFound();
  }

  // Get posts for this region
  const posts = getPostsByRegion(blogPosts, region);

  // If no posts for this region, still show the page with a message
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

  return <CategoryPage region={region} posts={postsForDisplay} />;
}
