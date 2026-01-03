/**
 * Wales Notice Validator Page
 */

import { ValidatorPage } from '@/components/validators/ValidatorPage';

export default function WalesNoticeValidatorPage() {
  return (
    <ValidatorPage
      validatorKey="wales_notice"
      title="Wales Notice Validator"
      description="Validate your Renting Homes (Wales) Act notices"
      jurisdiction="wales"
      caseType="eviction"
      productVariant="wales_notice"
      features={[
        'RHW16 no-fault notice check',
        'RHW17 breach notice check',
        'RHW23 landlord possession notice',
        'Written statement compliance',
        'Notice period verification',
        'Contract-holder rights check',
        'Fitness for human habitation',
        'Deposit protection (Wales)',
      ]}
      ctas={[
        { label: 'Notice Only Pack', href: '/products/notice-only?jurisdiction=wales', price: 29.99, primary: true },
        { label: 'Complete Eviction Pack', href: '/products/complete-pack?jurisdiction=wales', price: 149.99 },
      ]}
      additionalInfo="Since December 2022, Wales uses the Renting Homes (Wales) Act 2016 instead of the Housing Act 1988. 'Tenants' are now 'contract-holders' and 'tenancy agreements' are 'occupation contracts'. Different notice forms apply: RHW16 for no-fault, RHW17 for breach, and RHW23 for landlord's notice."
    />
  );
}
