import { getRentIncreaseGuideMetadata, RentIncreaseGuidePageView } from './RentIncreaseGuidePage';
import { getRentIncreaseHubPage } from './content';

const hubConfig = getRentIncreaseHubPage();

export const metadata = getRentIncreaseGuideMetadata(hubConfig);

export default function RentIncreaseHubPage() {
  return <RentIncreaseGuidePageView config={hubConfig} />;
}

