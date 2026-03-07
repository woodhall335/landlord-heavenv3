'use client';

import { createContext, useContext } from 'react';
import type { ProductCtaConfig } from '@/lib/blog/product-cta-map';

interface BlogCtaContextValue {
  cta: ProductCtaConfig;
  postSlug: string;
  category: string;
}

const BlogCtaContext = createContext<BlogCtaContextValue | null>(null);

interface BlogCtaProviderProps {
  value: BlogCtaContextValue;
  children: React.ReactNode;
}

export function BlogCtaProvider({ value, children }: BlogCtaProviderProps) {
  return <BlogCtaContext.Provider value={value}>{children}</BlogCtaContext.Provider>;
}

export function useBlogCtaContext(): BlogCtaContextValue | null {
  return useContext(BlogCtaContext);
}
