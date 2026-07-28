import type { AdditionalTenancyJurisdiction } from './non-england-rollout';

export interface NonEnglandTenancyCertification {
  modelParityVerified: boolean;
  prescribedDocumentWorkflowVerified: boolean;
  releaseEnabled: boolean;
  verificationBasis: string;
  notes: string;
}

export const NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION: Record<
  AdditionalTenancyJurisdiction,
  NonEnglandTenancyCertification
> = {
  wales: {
    modelParityVerified: true,
    prescribedDocumentWorkflowVerified: true,
    releaseEnabled: true,
    verificationBasis:
      'Product-owner release authorisation recorded 28 July 2026 after source-parity and workflow review.',
    notes:
      'Fixed-term and periodic standard occupation contracts are verified and enabled as standard products only.',
  },
  scotland: {
    modelParityVerified: true,
    prescribedDocumentWorkflowVerified: true,
    releaseEnabled: true,
    verificationBasis:
      'Product-owner release authorisation recorded 28 July 2026 after source-parity and workflow review.',
    notes:
      'The private residential tenancy and statutory supporting notes are verified and enabled as a standard product only.',
  },
  'northern-ireland': {
    modelParityVerified: true,
    prescribedDocumentWorkflowVerified: true,
    releaseEnabled: true,
    verificationBasis:
      'Product-owner release authorisation recorded 28 July 2026 after source-parity and workflow review.',
    notes:
      'The private tenancy, Tenancy Information Notice and rent book workflow are verified and enabled as a standard product only.',
  },
};

export function isNonEnglandStandardTenancyCertified(
  jurisdiction: AdditionalTenancyJurisdiction
): boolean {
  const certification =
    NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION[jurisdiction];

  return (
    certification.modelParityVerified &&
    certification.prescribedDocumentWorkflowVerified
  );
}
