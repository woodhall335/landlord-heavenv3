import { getRentIncreaseGuideMetadata, RentIncreaseGuidePageView } from '@/app/rent-increase/RentIncreaseGuidePage';
import { getRentIncreaseHubPage } from '@/app/rent-increase/content';

const guideConfig = {
  ...getRentIncreaseHubPage(),
  path: '/products/rent-increase',
};

export const metadata = getRentIncreaseGuideMetadata(guideConfig);

export default function RentIncreaseGuideProductPage() {
  return <RentIncreaseGuidePageView config={guideConfig} />;
}
