import { form4aGuidePage } from './config/form-4a-guide';
import { howToIncreaseRentPage } from './config/how-to-increase-rent';
import { rentIncreaseHubPage } from './config/hub';
import { marketRentCalculationPage } from './config/market-rent-calculation';
import { rentIncreaseChallengePage } from './config/rent-increase-challenge';
import { rentIncreaseRulesUkPage } from './config/rent-increase-rules-uk';
import { section13NoticePage } from './config/section13-notice';
import { section13TribunalPage } from './config/section-13-tribunal';
import { RENT_INCREASE_WIZARD_HREF } from './config/links';
import type {
  RentIncreaseGuideKey,
  RentIncreaseGuideLink,
  RentIncreaseGuidePage,
  RentIncreaseGuideSection,
  RentIncreaseGuideSlug,
} from './config/types';

export type {
  RentIncreaseGuideKey,
  RentIncreaseGuideLink,
  RentIncreaseGuidePage,
  RentIncreaseGuideSection,
  RentIncreaseGuideSlug,
} from './config/types';
export { RENT_INCREASE_WIZARD_HREF } from './config/links';

export const RENT_INCREASE_GUIDE_ORDER: RentIncreaseGuideKey[] = [
  'hub',
  'section-13-notice',
  'how-to-increase-rent',
  'rent-increase-rules-uk',
  'form-4a-guide',
  'section-13-tribunal',
  'market-rent-calculation',
  'rent-increase-challenge',
];

export const RENT_INCREASE_GUIDE_SLUGS: RentIncreaseGuideSlug[] = [
  'section-13-notice',
  'how-to-increase-rent',
  'rent-increase-rules-uk',
  'form-4a-guide',
  'section-13-tribunal',
  'market-rent-calculation',
  'rent-increase-challenge',
];

export const RENT_INCREASE_GUIDE_PAGES: Record<RentIncreaseGuideKey, RentIncreaseGuidePage> = {
  hub: rentIncreaseHubPage,
  'section-13-notice': section13NoticePage,
  'how-to-increase-rent': howToIncreaseRentPage,
  'rent-increase-rules-uk': rentIncreaseRulesUkPage,
  'form-4a-guide': form4aGuidePage,
  'section-13-tribunal': section13TribunalPage,
  'market-rent-calculation': marketRentCalculationPage,
  'rent-increase-challenge': rentIncreaseChallengePage,
};

export function getRentIncreaseGuidePage(slug: RentIncreaseGuideSlug): RentIncreaseGuidePage {
  return RENT_INCREASE_GUIDE_PAGES[slug];
}

export function getRentIncreaseHubPage(): RentIncreaseGuidePage {
  return RENT_INCREASE_GUIDE_PAGES.hub;
}
