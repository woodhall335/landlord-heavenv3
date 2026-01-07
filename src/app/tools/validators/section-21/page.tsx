/**
 * Section 21 Notice Validator Page
 */

import { ValidatorPage } from '@/components/validators/ValidatorPage';

export default function Section21ValidatorPage() {
  return (
    <ValidatorPage
      validatorKey="section_21"
      title="Section 21 Notice Validator"
      description="Check if your Section 21 notice is valid and court-ready"
      jurisdiction="england"
      caseType="eviction"
      productVariant="section21_england"
      features={[
        'Deposit protection verification',
        'Prescribed information check',
        'How to Rent guide compliance',
        'Notice period calculation',
        'Form 6A compliance',
        'Gas safety certificate check',
        'EPC validity check',
        'EICR requirements (post-2020)',
      ]}
      additionalInfo="A Section 21 notice (Form 6A) is used for 'no-fault' evictions in England under an Assured Shorthold Tenancy. Since October 2015, you must use the prescribed Form 6A and comply with various requirements including deposit protection, prescribed information, and providing the 'How to Rent' guide."
    />
  );
}
