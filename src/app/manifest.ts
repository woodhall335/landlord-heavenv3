import type { MetadataRoute } from 'next';
import { UNIVERSAL_HERO_THEME_COLOR } from '@/lib/seo/hero-theme';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Landlord Heaven',
    short_name: 'Landlord Heaven',
    description: 'Guided eviction, arrears, rent increase, and tenancy paperwork for UK landlords',
    start_url: '/',
    display: 'standalone',
    theme_color: UNIVERSAL_HERO_THEME_COLOR,
    background_color: UNIVERSAL_HERO_THEME_COLOR,
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
