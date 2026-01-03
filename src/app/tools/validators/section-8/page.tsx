/**
 * Section 8 Notice Validator Page
 */

import { ValidatorPage } from '@/components/validators/ValidatorPage';

export default function Section8ValidatorPage() {
  return (
    <ValidatorPage
      validatorKey="section_8"
      title="Section 8 Notice Validator"
      description="Validate your Section 8 notice and grounds for possession"
      jurisdiction="england"
      caseType="eviction"
      productVariant="section8_england"
      features={[
        'Ground validity verification',
        'Notice period calculation by ground',
        'Form 3 compliance check',
        'Mandatory vs discretionary grounds',
        'Evidence requirements per ground',
        'Rent arrears calculation (Ground 8)',
        'Anti-social behavior documentation',
        'Court hearing date calculation',
      ]}
      ctas={[
        { label: 'Notice Only Pack', href: '/products/notice-only?jurisdiction=england&product=section8', price: 29.99, primary: true },
        { label: 'Complete Eviction Pack', href: '/products/complete-pack?jurisdiction=england', price: 149.99 },
      ]}
      additionalInfo="A Section 8 notice (Form 3) is used when you have specific grounds for possession under Schedule 2 of the Housing Act 1988. Unlike Section 21, you must prove your grounds in court. Ground 8 (8+ weeks rent arrears) is mandatory if proved, while most other grounds are discretionary."
    />
  );
}
