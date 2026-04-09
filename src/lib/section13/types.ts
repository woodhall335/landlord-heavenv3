export const SECTION13_RULES_VERSION = 'england_assured_section13_2026-05-01' as const;

export type Section13ProductSku = 'section13_standard' | 'section13_defensive';
export type Section13CaseType = 'rent_increase';
export type Section13WorkflowStatus =
  | 'draft'
  | 'preview_ready'
  | 'awaiting_payment'
  | 'paid'
  | 'generating'
  | 'fulfilled'
  | 'bundle_partial_warning'
  | 'bundle_ready';

export type Section13RentFrequency = 'weekly' | 'fortnightly' | '4-weekly' | 'monthly';
export type Section13ComparableSourceKind =
  | 'scraped'
  | 'csv_import'
  | 'manual_linked'
  | 'manual_unlinked';
export type Section13SourceDateKind =
  | 'published'
  | 'first_listed'
  | 'reduced_or_updated'
  | 'unknown';
export type Section13AdjustmentCategory = 'location' | 'condition' | 'amenities' | 'custom';
export type Section13EvidenceStrengthBand = 'strong' | 'moderate' | 'weak';
export type Section13ChallengeLikelihoodBand =
  | 'lower_likelihood'
  | 'moderate_likelihood'
  | 'elevated_likelihood'
  | 'higher_likelihood';
export type Section13BundleLogicalSection =
  | 'cover'
  | 'index'
  | 'core_notice'
  | 'supporting_report'
  | 'correspondence'
  | 'uploaded_evidence';
export type Section13BundleAssetStatus = 'pending' | 'generated' | 'warning' | 'failed' | 'excluded';
export type Section13BundleJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'warning'
  | 'failed'
  | 'cancelled';
export type Section13BundleFailureType =
  | 'timeout'
  | 'memory'
  | 'merge_error'
  | 'upload_error'
  | 'unknown';
export type Section13BundleGenerationMode = 'sync' | 'async';
export type Section13SupportHandlingMode = 'automated' | 'escalated';
export type Section13SupportPriority = 'normal' | 'high' | 'urgent';
export type Section13SupportStatus = 'received' | 'in_review' | 'responded';

export interface Section13IncludedCharge {
  key: 'council_tax' | 'water' | 'electricity_gas_fuel' | 'communication_services' | 'fixed_service_charges';
  label: string;
  currentAmount?: number | null;
  proposedAmount?: number | null;
  included: boolean;
}

export interface Section13ComparableAdjustment {
  id?: string;
  comparableId?: string;
  category: Section13AdjustmentCategory;
  method?: string | null;
  inputValue?: number | null;
  normalizedMonthlyDelta: number;
  reason: string;
  sourceKind: 'system' | 'user';
  isOverride: boolean;
  sortOrder: number;
}

export interface Section13Comparable {
  id?: string;
  caseId?: string;
  postcodeRaw?: string | null;
  postcodeNormalized?: string | null;
  bedrooms?: number | null;
  source: Section13ComparableSourceKind;
  sourceUrl?: string | null;
  sourceDomain?: string | null;
  sourceDateValue?: string | null;
  sourceDateKind: Section13SourceDateKind;
  addressSnippet: string;
  propertyType?: string | null;
  listedAt?: string | null;
  distanceMiles?: number | null;
  rawRentValue: number;
  rawRentFrequency: Section13RentFrequency | 'pcm' | 'ppw';
  monthlyEquivalent: number;
  weeklyEquivalent: number;
  adjustedMonthlyEquivalent: number;
  isManual: boolean;
  scrapeBatchId?: string | null;
  sortOrder: number;
  adjustments: Section13ComparableAdjustment[];
  metadata?: Record<string, unknown>;
}

export interface Section13EvidenceUpload {
  id?: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  byteSize: number;
  title?: string | null;
  exhibitLabel?: string | null;
  orderIndex: number;
  uploadStatus: 'uploaded' | 'warning' | 'failed';
  warningMessage?: string | null;
  metadata?: Record<string, unknown>;
}

export interface Section13BundleAsset {
  id?: string;
  caseId?: string;
  rulesVersion: string;
  logicalSection: Section13BundleLogicalSection;
  assetType: 'form' | 'report' | 'evidence' | 'correspondence' | 'bundle' | 'zip';
  title: string;
  sourceKind: 'generated_document' | 'uploaded_evidence' | 'supporting_input';
  exhibitLabel?: string | null;
  orderIndex: number;
  includeInMerged: boolean;
  status: Section13BundleAssetStatus;
  pageCount?: number | null;
  generationError?: string | null;
  sourceDocumentId?: string | null;
  sourceUploadId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface Section13TenancyStep {
  tenantNames: string[];
  propertyAddressLine1: string;
  propertyAddressLine2?: string;
  propertyTownCity: string;
  postcodeRaw: string;
  postcodeNormalized?: string;
  bedrooms?: number | null;
  tenancyStartDate: string;
  currentRentAmount: number | null;
  currentRentFrequency: Section13RentFrequency;
  lastRentIncreaseDate?: string | null;
  firstIncreaseAfter2003Date?: string | null;
}

export interface Section13LandlordStep {
  landlordName: string;
  landlordAddressLine1: string;
  landlordAddressLine2?: string;
  landlordTownCity: string;
  landlordPostcodeRaw?: string;
  landlordPostcodeNormalized?: string;
  landlordPhone?: string;
  landlordEmail?: string;
  agentName?: string;
  agentAddressLine1?: string;
  agentAddressLine2?: string;
  agentTownCity?: string;
  agentPostcodeRaw?: string;
  agentPostcodeNormalized?: string;
  agentPhone?: string;
  agentEmail?: string;
}

export interface Section13ProposalStep {
  proposedRentAmount: number | null;
  proposedStartDate?: string | null;
  serviceDate?: string | null;
  serviceMethod?: 'hand_delivered' | 'post' | 'registered_post' | 'email' | 'other' | null;
  serviceMethodOther?: string | null;
}

export interface Section13PreviewMetrics {
  rulesVersion: string;
  comparableCount: number;
  sourceBackedCount: number;
  freshComparableCount: number;
  userOverrideCount: number;
  lowerQuartile: number | null;
  median: number | null;
  upperQuartile: number | null;
  proposedRentMonthly: number | null;
  proposedPositionLabel: string;
  challengeBand: Section13ChallengeLikelihoodBand;
  challengeBandLabel: string;
  challengeBandExplainer: string;
  evidenceBand: Section13EvidenceStrengthBand;
  evidenceBandLabel: string;
  evidenceBandExplainer: string;
  previewSummary: string;
  defensibilitySummarySentence: string;
  canAutoGenerateJustification: boolean;
  earliestValidStartDate: string | null;
  enteredStartDateValid: boolean;
  validationIssues: string[];
  warnings: string[];
}

export interface Section13OutputSnapshot {
  id?: string;
  orderId: string;
  caseId: string;
  rulesVersion: string;
  formAssetVersion: string;
  formAssetSha256: string;
  stateSnapshot: Section13State;
  previewMetrics: Section13PreviewMetrics;
  defensibilitySummarySentence: string;
  justificationSummaryText: string;
  justificationNarrativeText: string;
  comparableSnapshot: Section13Comparable[];
  createdAt?: string | null;
}

export interface Section13BundleJob {
  id?: string;
  caseId: string;
  orderId: string;
  outputSnapshotId: string;
  idempotencyKey: string;
  status: Section13BundleJobStatus;
  generationMode: Section13BundleGenerationMode;
  attemptCount: number;
  maxAttempts: number;
  retryAfter?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  peakRssMb?: number | null;
  warningCount?: number | null;
  failureType?: Section13BundleFailureType | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Section13SupportRequest {
  id?: string;
  caseId: string;
  latestConversationId?: string | null;
  handlingMode: Section13SupportHandlingMode;
  intentCode: string;
  blockedReason?: string | null;
  priority: Section13SupportPriority;
  deadlineAt?: string | null;
  status: Section13SupportStatus;
  assignedTo?: string | null;
  createdAt?: string | null;
  resolvedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface Section13State {
  rulesVersion: string;
  selectedPlan: Section13ProductSku;
  tenancy: Section13TenancyStep;
  landlord: Section13LandlordStep;
  proposal: Section13ProposalStep;
  includedCharges: Section13IncludedCharge[];
  comparablesMeta: {
    searchPostcodeRaw?: string;
    searchPostcodeNormalized?: string;
    bedrooms?: number | null;
    lastScrapeAt?: string | null;
    lastScrapeSource?: string | null;
    lastScrapeSummary?: string | null;
  };
  adjustments: {
    manualJustification?: string;
    challengeBandExplainer: string;
    evidenceBandExplainer: string;
  };
  preview?: Section13PreviewMetrics;
}
