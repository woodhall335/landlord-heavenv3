import type { AdditionalTenancyJurisdiction } from './non-england-rollout';

export interface NonEnglandTenancyCertification {
  modelParityVerified: boolean;
  solicitorApproved: boolean;
  prescribedDocumentWorkflowVerified: boolean;
  releaseEnabled: boolean;
  notes: string;
}

export const NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION: Record<
  AdditionalTenancyJurisdiction,
  NonEnglandTenancyCertification
> = {
  wales: {
    modelParityVerified: true,
    solicitorApproved: true,
    prescribedDocumentWorkflowVerified: true,
    releaseEnabled: true,
    notes:
      'Fixed-term and periodic standard occupation contracts are approved and enabled.',
  },
  scotland: {
    modelParityVerified: true,
    solicitorApproved: true,
    prescribedDocumentWorkflowVerified: true,
    releaseEnabled: true,
    notes:
      'The private residential tenancy and statutory supporting notes are approved and enabled.',
  },
  'northern-ireland': {
    modelParityVerified: true,
    solicitorApproved: true,
    prescribedDocumentWorkflowVerified: true,
    releaseEnabled: true,
    notes:
      'The private tenancy, Tenancy Information Notice and rent book workflow are approved and enabled.',
  },
};

export function isNonEnglandStandardTenancyCertified(
  jurisdiction: AdditionalTenancyJurisdiction
): boolean {
  const certification =
    NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION[jurisdiction];

  return (
    certification.modelParityVerified &&
    certification.solicitorApproved &&
    certification.prescribedDocumentWorkflowVerified
  );
}
