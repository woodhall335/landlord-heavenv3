/**
 * Tenancy Agreement Validator Page
 *
 * Supports all UK jurisdictions - user selects during validation.
 */

import { ValidatorPage } from '@/components/validators/ValidatorPage';

export default function TenancyAgreementValidatorPage() {
  return (
    <ValidatorPage
      validatorKey="tenancy_agreement"
      title="Tenancy Agreement Validator"
      description="Check your tenancy agreement for missing or problematic clauses"
      jurisdiction="all"
      caseType="tenancy_agreement"
      productVariant="ast_standard"
      features={[
        'Required clauses check',
        'Unfair terms identification',
        'Deposit protection terms',
        'Break clause validation',
        'Rent review provisions',
        'Notice periods compliance',
        'HMO-specific terms',
        'PRT/Occupation Contract compliance',
      ]}
      ctas={[
        { label: 'Standard AST', href: '/products/ast?tier=standard', price: 9.99, primary: true },
        { label: 'Premium AST', href: '/products/ast?tier=premium', price: 14.99 },
      ]}
      additionalInfo="A well-drafted tenancy agreement protects both landlord and tenant. Key elements include clear rent terms, deposit protection details, break clauses, and obligations for repairs and maintenance. Different rules apply in England, Wales (Occupation Contracts), Scotland (PRT), and Northern Ireland."
    />
  );
}
