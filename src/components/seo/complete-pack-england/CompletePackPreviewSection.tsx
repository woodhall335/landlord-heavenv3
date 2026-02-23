'use client';

import dynamic from 'next/dynamic';
import { StaticPreviewFallback } from './StaticPreviewFallback';

const PreviewStack = dynamic(
  () => import('@/components/seo/complete-pack-england/PreviewStack').then((mod) => mod.PreviewStack),
  {
    ssr: false,
    loading: () => <StaticPreviewFallback />,
  }
);

export function CompletePackPreviewSection() {
  return <PreviewStack />;
}
