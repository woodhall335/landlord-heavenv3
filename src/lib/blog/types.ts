import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SourceLink {
  title: string;
  url: string;
  type: 'legislation' | 'government' | 'official' | 'reference';
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  metaDescription: string; // SEO optimized, 150-160 chars
  date: string;
  updatedDate?: string;
  readTime: string;
  wordCount: number;
  category: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    image?: string;
  };
  reviewer?: {
    name: string;
    role: string;
  };
  heroImage: string;
  heroImageAlt: string;
  showUrgencyBanner: boolean;
  tableOfContents: { id: string; title: string; level: number }[];
  relatedPosts: string[];
  targetKeyword: string;
  secondaryKeywords: string[];
  content: React.ReactNode;
  faqs?: FAQItem[]; // Optional FAQ section for rich snippets
  sources?: SourceLink[]; // Official sources for EEAT
  canonicalSlug?: string; // For near-duplicate posts, point to the canonical version
}
