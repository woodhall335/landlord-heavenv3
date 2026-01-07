/**
 * Scotland Notice to Leave Validator Page
 */

import { ValidatorPage } from '@/components/validators/ValidatorPage';

export default function ScotlandNoticeValidatorPage() {
  return (
    <ValidatorPage
      validatorKey="scotland_notice_to_leave"
      title="Scotland Notice to Leave Validator"
      description="Validate your Notice to Leave under PRT rules"
      jurisdiction="scotland"
      caseType="eviction"
      productVariant="scotland_notice_to_leave"
      features={[
        'PRT ground verification',
        'Notice period calculation',
        'Prescribed form compliance',
        'Rent arrears calculation',
        'Anti-social behavior grounds',
        'Landlord selling/moving in',
        'First-tier Tribunal readiness',
        'Evidence requirements',
      ]}
      additionalInfo="Scotland uses the Private Housing (Tenancies) (Scotland) Act 2016 for most residential tenancies. There are 18 grounds for eviction, and cases are heard by the First-tier Tribunal for Scotland rather than the courts. Notice periods range from 28 days to 84 days depending on the ground and tenancy length."
    />
  );
}
