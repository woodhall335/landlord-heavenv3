/**
 * Eviction Wizard Section Components
 *
 * These sections form the redesigned England Eviction Wizard (Complete Pack).
 * Each section handles a specific logical step in the eviction process.
 *
 * Flow Order:
 * 1. CaseBasicsSection - Jurisdiction and eviction route
 * 2. PartiesSection - Landlord and tenant details
 * 3. PropertySection - Property address
 * 4. TenancySection - Tenancy details and rent
 * 5. NoticeSection - Notice service and grounds
 * 6. Section21ComplianceSection - S21 compliance checks (S21 only)
 * 7. Section8ArrearsSection - Arrears schedule (S8 only)
 * 8. EvidenceSection - Supporting document uploads
 * 9. CourtSigningSection - Court and signatory details
 * 10. ReviewSection - Final review and document generation
 */

export { CaseBasicsSection } from './CaseBasicsSection';
export { PartiesSection } from './PartiesSection';
export { PropertySection } from './PropertySection';
export { TenancySection } from './TenancySection';
export { NoticeSection } from './NoticeSection';
export { Section21ComplianceSection } from './Section21ComplianceSection';
export { Section8ArrearsSection } from './Section8ArrearsSection';
export { EvidenceSection } from './EvidenceSection';
export { CourtSigningSection } from './CourtSigningSection';
export { ReviewSection } from './ReviewSection';
export { WalesNoticeSection } from './WalesNoticeSection';

// Re-export the existing CourtDetailsSection for backward compatibility
export { CourtDetailsSection } from './CourtDetailsSection';
