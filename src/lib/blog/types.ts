import React from 'react';

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
  heroImage: string;
  heroImageAlt: string;
  showUrgencyBanner: boolean;
  tableOfContents: { id: string; title: string; level: number }[];
  relatedPosts: string[];
  targetKeyword: string;
  secondaryKeywords: string[];
  content: React.ReactNode;
}
