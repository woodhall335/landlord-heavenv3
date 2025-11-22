/**
 * Northern Ireland Document Generators
 *
 * Exports all document generation functions for Northern Ireland jurisdiction
 * under the Private Tenancies (Northern Ireland) Order 2006.
 */

// Notice to Quit
export {
  generateNoticeToQuit,
  validateNoticeToQuitData,
  buildGround8SeriousArrears,
  buildGround10RentArrears,
  buildGround12Breach,
  buildGround14ASB,
  buildGround1LandlordPreviousOccupation,
  buildGround5LandlordIntention,
  calculateNoticePeriod,
  calculateQuitDate,
  generateSampleNoticeToQuit,
  type NoticeToQuitData,
  type LandlordDetails as NoticeToQuitLandlordDetails,
  type TenantDetails as NoticeToQuitTenantDetails,
  type PropertyDetails as NoticeToQuitPropertyDetails,
  type RentDetails as NoticeToQuitRentDetails,
  type RentArrearsBreakdown,
  type GroundDefinition,
  type ValidationResult as NoticeToQuitValidationResult,
} from './notice-to-quit-generator';

// Private Tenancy Agreement
export {
  generatePrivateTenancyAgreement,
  validatePrivateTenancyData,
  validateDepositAmount,
  generateSamplePrivateTenancyAgreement,
  generateSamplePrivateTenancyWithAgent,
  type PrivateTenancyData,
  type LandlordDetails as PrivateTenancyLandlordDetails,
  type AgentDetails as PrivateTenancyAgentDetails,
  type TenantDetails as PrivateTenancyTenantDetails,
  type PropertyDetails as PrivateTenancyPropertyDetails,
  type TenancyTerms,
  type RentDetails as PrivateTenancyRentDetails,
  type DepositDetails,
  type InventoryDetails,
  type AdditionalTerms,
  type ValidationResult as PrivateTenancyValidationResult,
} from './private-tenancy-generator';

// Wizard Mapper
export {
  mapWizardToNoticeToQuit,
  type NIWizardFacts,
} from './wizard-mapper';
