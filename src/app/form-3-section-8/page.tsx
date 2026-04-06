import type { Metadata } from 'next';
import {
  CurrentFrameworkGuidePage,
  getCurrentFrameworkMetadata,
} from '@/components/seo/CurrentFrameworkGuidePage';
import { getCurrentFrameworkPageConfig } from '@/lib/seo/england-current-framework-pages';

const config = getCurrentFrameworkPageConfig('form-3-section-8');

export const metadata: Metadata = getCurrentFrameworkMetadata(config);

export default function Page() {
  return <CurrentFrameworkGuidePage config={config} />;
}
