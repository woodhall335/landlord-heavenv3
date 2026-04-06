import type { Metadata } from 'next';
import {
  CurrentFrameworkGuidePage,
  getCurrentFrameworkMetadata,
} from '@/components/seo/CurrentFrameworkGuidePage';
import { getCurrentFrameworkPageConfig } from '@/lib/seo/england-current-framework-pages';

const config = getCurrentFrameworkPageConfig('renters-rights-act-eviction-rules');

export const metadata: Metadata = getCurrentFrameworkMetadata(config);

export default function Page() {
  return <CurrentFrameworkGuidePage config={config} />;
}
