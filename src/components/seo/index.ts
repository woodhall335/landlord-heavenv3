/**
 * SEO Components
 *
 * Components for search engine optimization and commercial linking.
 */

// Commercial Linking
export {
  CommercialWizardLinks,
  type CommercialWizardLinksProps,
} from './CommercialWizardLinks';

export {
  ContentLinker,
  ServerContentLinker,
  useCommercialLinking,
  type ContentLinkerProps,
  type ServerContentLinkerProps,
} from './ContentLinker';

// Re-export utilities from lib
export {
  analyzeContent,
  detectIntent,
  detectJurisdiction,
  isEligiblePath,
  isLinkAllowed,
  COMMERCIAL_LINK_TARGETS,
  KEYWORD_GROUPS,
  type CommercialIntent,
  type Jurisdiction,
  type CommercialLinkingResult,
  type AnalyzeContentOptions,
} from '@/lib/seo/commercial-linking';
