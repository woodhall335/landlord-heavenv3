/**
 * Money Claim Validator Page
 */

import { ValidatorPage } from '@/components/validators/ValidatorPage';

export default function MoneyClaimValidatorPage() {
  return (
    <ValidatorPage
      validatorKey="money_claim"
      title="Money Claim Validator"
      description="Check your rent arrears evidence and claim documentation"
      jurisdiction="england"
      caseType="money_claim"
      productVariant="money_claim_england_wales"
      features={[
        'Arrears schedule completeness',
        'Pre-action protocol compliance',
        'Letter before action check',
        'Interest calculation',
        'Evidence bundle review',
        'Particulars of claim',
        'N1/Form 3A compliance',
        'Witness statement requirements',
      ]}
      additionalInfo="Before starting a money claim for rent arrears, you must follow the Pre-Action Protocol for Debt Claims. This includes sending a Letter Before Action and giving the debtor at least 30 days to respond. In England & Wales, claims are made using Form N1; in Scotland, Form 3A for the Simple Procedure."
    />
  );
}
