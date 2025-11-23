/**
 * Northern Ireland Document Generators
 *
 * Only tenancy agreement workflows are supported for this jurisdiction.
 */

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
