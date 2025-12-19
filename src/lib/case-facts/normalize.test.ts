import { describe, test, expect } from 'vitest';
import { wizardFactsToCaseFacts } from './normalize';
import type { WizardFacts } from './schema';

describe('wizardFactsToCaseFacts', () => {
  // =============================================================================
  // PROPERTY MAPPING TESTS
  // =============================================================================

  describe('Property Mapping', () => {
    test('should map property address fields correctly', () => {
      const wizard: WizardFacts = {
        property_address_line1: '123 High Street',
        property_address_line2: 'Flat 4B',
        property_city: 'London',
        property_postcode: 'SW1A 1AA',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.address_line1).toBe('123 High Street');
      expect(result.property.address_line2).toBe('Flat 4B');
      expect(result.property.city).toBe('London');
      expect(result.property.postcode).toBe('SW1A 1AA');
    });

    test('should map property country from property_country field', () => {
      const wizard: WizardFacts = {
        property_country: 'england-wales',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.country).toBe('england');
    });

    test('should fallback to jurisdiction field for country', () => {
      const wizard: WizardFacts = {
        jurisdiction: 'scotland',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.country).toBe('scotland');
    });

    test('should prefer property_country over jurisdiction', () => {
      const wizard: WizardFacts = {
        property_country: 'england-wales',
        jurisdiction: 'scotland',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.country).toBe('england');
    });

    test('should map HMO status', () => {
      const wizard: WizardFacts = {
        property_is_hmo: true,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.is_hmo).toBe(true);
    });

    test('should default missing property fields to null', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.address_line1).toBeNull();
      expect(result.property.address_line2).toBeNull();
      expect(result.property.city).toBeNull();
      expect(result.property.postcode).toBeNull();
      expect(result.property.country).toBeNull();
      expect(result.property.is_hmo).toBeNull();
    });
  });

  // =============================================================================
  // TENANCY MAPPING TESTS
  // =============================================================================

  describe('Tenancy Mapping', () => {
    test('should map basic tenancy fields correctly', () => {
      const wizard: WizardFacts = {
        tenancy_type: 'ast',
        tenancy_start_date: '2024-01-15',
        tenancy_end_date: '2025-01-14',
        rent_amount: 1500,
        rent_frequency: 'monthly',
        deposit_amount: 2000,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.tenancy.tenancy_type).toBe('ast');
      expect(result.tenancy.start_date).toBe('2024-01-15');
      expect(result.tenancy.end_date).toBe('2025-01-14');
      expect(result.tenancy.rent_amount).toBe(1500);
      expect(result.tenancy.rent_frequency).toBe('monthly');
      expect(result.tenancy.deposit_amount).toBe(2000);
    });

    test('should map fixed term fields correctly', () => {
      const wizard: WizardFacts = {
        tenancy_fixed_term: true,
        tenancy_fixed_term_months: 12,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.tenancy.fixed_term).toBe(true);
      expect(result.tenancy.fixed_term_months).toBe(12);
    });

    test('should map deposit protection fields correctly', () => {
      const wizard: WizardFacts = {
        deposit_protected: true,
        deposit_scheme_name: 'Deposit Protection Service',
        deposit_protection_date: '2024-01-20',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.tenancy.deposit_protected).toBe(true);
      expect(result.tenancy.deposit_scheme_name).toBe('Deposit Protection Service');
      expect(result.tenancy.deposit_protection_date).toBe('2024-01-20');
    });

    test('should map rent due day correctly', () => {
      const wizard: WizardFacts = {
        rent_due_day: 1,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.tenancy.rent_due_day).toBe(1);
    });

    test('should default tenancy_type to "unknown" when missing', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.tenancy.tenancy_type).toBe('unknown');
    });

    test('should default missing tenancy fields to null', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.tenancy.start_date).toBeNull();
      expect(result.tenancy.end_date).toBeNull();
      expect(result.tenancy.fixed_term).toBeNull();
      expect(result.tenancy.fixed_term_months).toBeNull();
      expect(result.tenancy.rent_amount).toBeNull();
      expect(result.tenancy.rent_frequency).toBeNull();
      expect(result.tenancy.rent_due_day).toBeNull();
      expect(result.tenancy.deposit_amount).toBeNull();
      expect(result.tenancy.deposit_protected).toBeNull();
      expect(result.tenancy.deposit_scheme_name).toBeNull();
      expect(result.tenancy.deposit_protection_date).toBeNull();
    });
  });

  // =============================================================================
  // PARTIES MAPPING TESTS
  // =============================================================================

  describe('Parties Mapping - Landlord', () => {
    test('should map landlord details with underscore notation', () => {
      const wizard: WizardFacts = {
        landlord_name: 'John Smith',
        landlord_email: 'john.smith@example.com',
        landlord_phone: '020 1234 5678',
        landlord_address_line1: '456 Park Avenue',
        landlord_address_line2: 'Suite 100',
        landlord_city: 'Manchester',
        landlord_postcode: 'M1 1AA',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.landlord.name).toBe('John Smith');
      expect(result.parties.landlord.email).toBe('john.smith@example.com');
      expect(result.parties.landlord.phone).toBe('020 1234 5678');
      expect(result.parties.landlord.address_line1).toBe('456 Park Avenue');
      expect(result.parties.landlord.address_line2).toBe('Suite 100');
      expect(result.parties.landlord.city).toBe('Manchester');
      expect(result.parties.landlord.postcode).toBe('M1 1AA');
    });

    test('should map landlord details with dot notation fallback', () => {
      const wizard: WizardFacts = {
        'landlord.name': 'Jane Doe',
        'landlord.email': 'jane.doe@example.com',
        'landlord.phone': '0131 987 6543',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.landlord.name).toBe('Jane Doe');
      expect(result.parties.landlord.email).toBe('jane.doe@example.com');
      expect(result.parties.landlord.phone).toBe('0131 987 6543');
    });

    test('should prefer underscore notation over dot notation for landlord', () => {
      const wizard: WizardFacts = {
        landlord_name: 'John Smith',
        'landlord.name': 'Jane Doe',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.landlord.name).toBe('John Smith');
    });

    test('should default missing landlord fields to null', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.landlord.name).toBeNull();
      expect(result.parties.landlord.email).toBeNull();
      expect(result.parties.landlord.phone).toBeNull();
      expect(result.parties.landlord.address_line1).toBeNull();
      expect(result.parties.landlord.address_line2).toBeNull();
      expect(result.parties.landlord.city).toBeNull();
      expect(result.parties.landlord.postcode).toBeNull();
    });
  });

  describe('Parties Mapping - Tenants', () => {
    test('should map single tenant correctly', () => {
      const wizard: WizardFacts = {
        'tenants.0.full_name': 'Alice Johnson',
        'tenants.0.email': 'alice.johnson@example.com',
        'tenants.0.phone': '07700 900000',
        'tenants.0.address_line1': '789 Oak Street',
        'tenants.0.city': 'Birmingham',
        'tenants.0.postcode': 'B1 1AA',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants).toHaveLength(1);
      expect(result.parties.tenants[0].name).toBe('Alice Johnson');
      expect(result.parties.tenants[0].email).toBe('alice.johnson@example.com');
      expect(result.parties.tenants[0].phone).toBe('07700 900000');
      expect(result.parties.tenants[0].address_line1).toBe('789 Oak Street');
      expect(result.parties.tenants[0].city).toBe('Birmingham');
      expect(result.parties.tenants[0].postcode).toBe('B1 1AA');
    });

    test('should support alternate tenant name field', () => {
      const wizard: WizardFacts = {
        'tenants.0.name': 'Bob Wilson',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants[0].name).toBe('Bob Wilson');
    });

    test('should prefer full_name over name for tenants', () => {
      const wizard: WizardFacts = {
        'tenants.0.full_name': 'Alice Johnson',
        'tenants.0.name': 'Bob Wilson',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants[0].name).toBe('Alice Johnson');
    });

    test('should support alternate phone field name', () => {
      const wizard: WizardFacts = {
        'tenants.0.full_name': 'Charlie Brown',
        'tenants.0.phone_number': '07700 900001',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants[0].phone).toBe('07700 900001');
    });

    test('should map multiple tenants correctly', () => {
      const wizard: WizardFacts = {
        'tenants.0.full_name': 'Alice Johnson',
        'tenants.0.email': 'alice@example.com',
        'tenants.1.full_name': 'Bob Wilson',
        'tenants.1.email': 'bob@example.com',
        'tenants.2.full_name': 'Charlie Brown',
        'tenants.2.email': 'charlie@example.com',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants).toHaveLength(3);
      expect(result.parties.tenants[0].name).toBe('Alice Johnson');
      expect(result.parties.tenants[0].email).toBe('alice@example.com');
      expect(result.parties.tenants[1].name).toBe('Bob Wilson');
      expect(result.parties.tenants[1].email).toBe('bob@example.com');
      expect(result.parties.tenants[2].name).toBe('Charlie Brown');
      expect(result.parties.tenants[2].email).toBe('charlie@example.com');
    });

    test('should handle non-sequential tenant indices correctly', () => {
      const wizard: WizardFacts = {
        'tenants.0.full_name': 'Alice Johnson',
        'tenants.2.full_name': 'Charlie Brown',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants).toHaveLength(2);
      expect(result.parties.tenants[0].name).toBe('Alice Johnson');
      expect(result.parties.tenants[1].name).toBe('Charlie Brown');
    });

    test('should return empty array when no tenants present', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants).toEqual([]);
    });

    test('should handle partial tenant data gracefully', () => {
      const wizard: WizardFacts = {
        'tenants.0.full_name': 'Alice Johnson',
        // Missing other fields
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.tenants).toHaveLength(1);
      expect(result.parties.tenants[0].name).toBe('Alice Johnson');
      expect(result.parties.tenants[0].email).toBeNull();
      expect(result.parties.tenants[0].phone).toBeNull();
      expect(result.parties.tenants[0].address_line1).toBeNull();
    });
  });

  describe('Parties Mapping - Agent and Solicitor', () => {
    test('should map agent details correctly', () => {
      const wizard: WizardFacts = {
        agent_name: 'Premier Properties',
        agent_email: 'contact@premier.com',
        agent_phone: '020 9999 8888',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.agent.name).toBe('Premier Properties');
      expect(result.parties.agent.email).toBe('contact@premier.com');
      expect(result.parties.agent.phone).toBe('020 9999 8888');
    });

    test('should map solicitor details correctly', () => {
      const wizard: WizardFacts = {
        solicitor_name: 'Smith & Partners LLP',
        solicitor_email: 'legal@smithpartners.com',
        solicitor_phone: '020 7777 6666',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.solicitor.name).toBe('Smith & Partners LLP');
      expect(result.parties.solicitor.email).toBe('legal@smithpartners.com');
      expect(result.parties.solicitor.phone).toBe('020 7777 6666');
    });

    test('should default missing agent and solicitor fields to null', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.parties.agent.name).toBeNull();
      expect(result.parties.agent.email).toBeNull();
      expect(result.parties.solicitor.name).toBeNull();
      expect(result.parties.solicitor.email).toBeNull();
    });
  });

  // =============================================================================
  // META MAPPING TESTS
  // =============================================================================

  describe('Meta Mapping', () => {
    test('should map product metadata correctly', () => {
      const wizard: WizardFacts = {
        __meta: {
          product: 'tenancy_agreement',
          original_product: 'tenancy_agreement/england-wales',
          product_tier: 'premium',
        },
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.meta.product).toBe('tenancy_agreement');
      expect(result.meta.original_product).toBe('tenancy_agreement/england-wales');
      expect(result.meta.product_tier).toBe('premium');
    });

    test('should handle missing __meta gracefully', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.meta.product).toBeNull();
      expect(result.meta.original_product).toBeNull();
      expect(result.meta.product_tier).toBeNull();
    });

    test('should handle partial __meta fields', () => {
      const wizard: WizardFacts = {
        __meta: {
          product: 'eviction',
          original_product: null,
        },
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.meta.product).toBe('eviction');
      expect(result.meta.original_product).toBeNull();
      expect(result.meta.product_tier).toBeNull();
    });
  });

  // =============================================================================
  // COMPREHENSIVE INTEGRATION TESTS
  // =============================================================================

  describe('Full AST Flow Integration', () => {
    test('should map complete AST England/Wales case correctly', () => {
      const wizard: WizardFacts = {
        __meta: {
          product: 'tenancy_agreement',
          original_product: 'tenancy_agreement/england-wales',
          product_tier: 'standard',
        },

        // Property
        property_address_line1: '123 High Street',
        property_address_line2: 'Flat 4B',
        property_city: 'London',
        property_postcode: 'SW1A 1AA',
        property_country: 'england-wales',
        property_is_hmo: false,

        // Tenancy
        tenancy_type: 'ast',
        tenancy_start_date: '2024-01-15',
        tenancy_end_date: '2025-01-14',
        tenancy_fixed_term: true,
        tenancy_fixed_term_months: 12,
        rent_amount: 1500,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        deposit_amount: 2000,
        deposit_protected: true,
        deposit_scheme_name: 'Deposit Protection Service',
        deposit_protection_date: '2024-01-20',

        // Landlord
        landlord_name: 'John Smith',
        landlord_email: 'john.smith@example.com',
        landlord_phone: '020 1234 5678',
        landlord_address_line1: '456 Park Avenue',
        landlord_city: 'Manchester',
        landlord_postcode: 'M1 1AA',

        // Tenant
        'tenants.0.full_name': 'Alice Johnson',
        'tenants.0.email': 'alice.johnson@example.com',
        'tenants.0.phone': '07700 900000',
      };

      const result = wizardFactsToCaseFacts(wizard);

      // Verify meta
      expect(result.meta.product).toBe('tenancy_agreement');
      expect(result.meta.original_product).toBe('tenancy_agreement/england-wales');
      expect(result.meta.product_tier).toBe('standard');

      // Verify property
      expect(result.property.address_line1).toBe('123 High Street');
      expect(result.property.postcode).toBe('SW1A 1AA');
      expect(result.property.country).toBe('england');
      expect(result.property.is_hmo).toBe(false);

      // Verify tenancy
      expect(result.tenancy.tenancy_type).toBe('ast');
      expect(result.tenancy.start_date).toBe('2024-01-15');
      expect(result.tenancy.rent_amount).toBe(1500);
      expect(result.tenancy.deposit_amount).toBe(2000);
      expect(result.tenancy.deposit_protected).toBe(true);

      // Verify parties
      expect(result.parties.landlord.name).toBe('John Smith');
      expect(result.parties.landlord.email).toBe('john.smith@example.com');
      expect(result.parties.tenants).toHaveLength(1);
      expect(result.parties.tenants[0].name).toBe('Alice Johnson');
      expect(result.parties.tenants[0].email).toBe('alice.johnson@example.com');
    });

    test('should map premium tier AST with multiple tenants', () => {
      const wizard: WizardFacts = {
        __meta: {
          product: 'tenancy_agreement',
          original_product: 'tenancy_agreement/england-wales',
          product_tier: 'premium',
        },

        property_address_line1: '789 Main Road',
        property_postcode: 'EC1A 1BB',
        property_country: 'england-wales',
        property_is_hmo: true,

        tenancy_type: 'ast',
        tenancy_start_date: '2024-02-01',
        rent_amount: 2400,
        deposit_amount: 3200,

        landlord_name: 'Sarah Williams',
        landlord_email: 'sarah@example.com',

        'tenants.0.full_name': 'Alice Johnson',
        'tenants.0.email': 'alice@example.com',
        'tenants.1.full_name': 'Bob Wilson',
        'tenants.1.email': 'bob@example.com',
        'tenants.2.full_name': 'Charlie Brown',
        'tenants.2.email': 'charlie@example.com',

        agent_name: 'Premier Lettings Ltd',
        agent_email: 'info@premier.com',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.meta.product_tier).toBe('premium');
      expect(result.property.is_hmo).toBe(true);
      expect(result.parties.tenants).toHaveLength(3);
      expect(result.parties.tenants[0].name).toBe('Alice Johnson');
      expect(result.parties.tenants[1].name).toBe('Bob Wilson');
      expect(result.parties.tenants[2].name).toBe('Charlie Brown');
      expect(result.parties.agent.name).toBe('Premier Lettings Ltd');
    });
  });

  // =============================================================================
  // EDGE CASES AND ERROR HANDLING
  // =============================================================================

  describe('Edge Cases', () => {
    test('should handle completely empty wizard facts', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      // Should not throw and should return valid structure
      expect(result).toBeDefined();
      expect(result.property).toBeDefined();
      expect(result.tenancy).toBeDefined();
      expect(result.parties).toBeDefined();
      expect(result.meta).toBeDefined();

      // Key defaults
      expect(result.tenancy.tenancy_type).toBe('unknown');
      expect(result.parties.tenants).toEqual([]);
    });

    test('should handle null values in wizard facts', () => {
      const wizard: WizardFacts = {
        property_address_line1: null,
        rent_amount: null,
        landlord_name: null,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.address_line1).toBeNull();
      expect(result.tenancy.rent_amount).toBeNull();
      expect(result.parties.landlord.name).toBeNull();
    });

    test('should handle undefined values in wizard facts', () => {
      const wizard: WizardFacts = {
        property_address_line1: undefined,
        rent_amount: undefined,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.address_line1).toBeNull();
      expect(result.tenancy.rent_amount).toBeNull();
    });

    test('should not explode with unexpected field types', () => {
      const wizard: WizardFacts = {
        property_address_line1: 123 as any, // Wrong type
        rent_amount: 'not a number' as any, // Wrong type
      };

      const result = wizardFactsToCaseFacts(wizard);

      // Should still map the values even if types are wrong
      expect(result.property.address_line1).toBe(123);
      expect(result.tenancy.rent_amount).toBe('not a number');
    });

    test('should handle special characters in string fields', () => {
      const wizard: WizardFacts = {
        property_address_line1: '123 O\'Brien Street, Apt #4',
        landlord_name: 'José García-López',
        'tenants.0.full_name': 'François Müller-Schmidt',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.address_line1).toBe('123 O\'Brien Street, Apt #4');
      expect(result.parties.landlord.name).toBe('José García-López');
      expect(result.parties.tenants[0].name).toBe('François Müller-Schmidt');
    });

    test('should handle zero values correctly', () => {
      const wizard: WizardFacts = {
        rent_amount: 0,
        deposit_amount: 0,
        rent_due_day: 0,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.tenancy.rent_amount).toBe(0);
      expect(result.tenancy.deposit_amount).toBe(0);
      expect(result.tenancy.rent_due_day).toBe(0);
    });

    test('should handle boolean false values correctly', () => {
      const wizard: WizardFacts = {
        property_is_hmo: false,
        tenancy_fixed_term: false,
        deposit_protected: false,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.property.is_hmo).toBe(false);
      expect(result.tenancy.fixed_term).toBe(false);
      expect(result.tenancy.deposit_protected).toBe(false);
    });
  });

  // =============================================================================
  // OTHER SECTIONS (Issues, Notice, Court, Evidence, Service Contact)
  // =============================================================================

  describe('Issues Mapping', () => {
    test('should map rent arrears fields', () => {
      const wizard: WizardFacts = {
        has_rent_arrears: true,
        total_arrears: 3000,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.issues.rent_arrears.has_arrears).toBe(true);
      expect(result.issues.rent_arrears.total_arrears).toBe(3000);
      expect(result.issues.rent_arrears.arrears_items).toEqual([]);
    });

    test('should map ASB fields', () => {
      const wizard: WizardFacts = {
        has_asb: true,
        asb_description: 'Noise complaints from neighbors',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.issues.asb.has_asb).toBe(true);
      expect(result.issues.asb.description).toBe('Noise complaints from neighbors');
      expect(result.issues.asb.incidents).toEqual([]);
    });

    test('should map other breaches fields', () => {
      const wizard: WizardFacts = {
        has_other_breaches: true,
        other_breaches_description: 'Unauthorized subletting',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.issues.other_breaches.has_breaches).toBe(true);
      expect(result.issues.other_breaches.description).toBe('Unauthorized subletting');
    });
  });

  describe('Notice Mapping', () => {
    test('should map notice fields correctly', () => {
      const wizard: WizardFacts = {
        notice_type: 'section_8',
        notice_date: '2024-03-01',
        notice_expiry_date: '2024-05-01',
        notice_service_method: 'hand_delivery',
        notice_served_by: 'landlord',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.notice.notice_type).toBe('section_8');
      expect(result.notice.notice_date).toBe('2024-03-01');
      expect(result.notice.expiry_date).toBe('2024-05-01');
      expect(result.notice.service_method).toBe('hand_delivery');
      expect(result.notice.served_by).toBe('landlord');
    });

    test('should handle alternate expiry_date field name', () => {
      const wizard: WizardFacts = {
        expiry_date: '2024-06-01',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.notice.expiry_date).toBe('2024-06-01');
    });
  });

  describe('Court Mapping', () => {
    test('should map court claim fields correctly', () => {
      const wizard: WizardFacts = {
        court_route: 'standard_possession',
        claim_amount_rent: 3000,
        claim_amount_costs: 500,
        claim_amount_other: 200,
        total_claim_amount: 3700,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.court.route).toBe('standard_possession');
      expect(result.court.claim_amount_rent).toBe(3000);
      expect(result.court.claim_amount_costs).toBe(500);
      expect(result.court.claim_amount_other).toBe(200);
      expect(result.court.total_claim_amount).toBe(3700);
    });

    test('should map court form requirements correctly', () => {
      const wizard: WizardFacts = {
        n5_required: true,
        n119_required: false,
        n1_required: true,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.court.n5_required).toBe(true);
      expect(result.court.n119_required).toBe(false);
      expect(result.court.n1_required).toBe(true);
    });
  });

  describe('Evidence Mapping', () => {
    test('should map evidence upload flags correctly', () => {
      const wizard: WizardFacts = {
        'evidence.tenancy_agreement_uploaded': true,
        'evidence.rent_schedule_uploaded': true,
        'evidence.bank_statements_uploaded': false,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.evidence.tenancy_agreement_uploaded).toBe(true);
      expect(result.evidence.rent_schedule_uploaded).toBe(true);
      expect(result.evidence.bank_statements_uploaded).toBe(false);
    });

    test('should default evidence flags to false when missing', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.evidence.tenancy_agreement_uploaded).toBe(false);
      expect(result.evidence.rent_schedule_uploaded).toBe(false);
      expect(result.evidence.bank_statements_uploaded).toBe(false);
    });
  });

  describe('Service Contact Mapping', () => {
    test('should map service contact with dot notation', () => {
      const wizard: WizardFacts = {
        'service_contact.service_name': 'Legal Services Ltd',
        'service_contact.service_email': 'service@legal.com',
        'service_contact.service_phone': '020 5555 4444',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.service_contact.service_name).toBe('Legal Services Ltd');
      expect(result.service_contact.service_email).toBe('service@legal.com');
      expect(result.service_contact.service_phone).toBe('020 5555 4444');
    });

    test('should fallback to underscore notation for service contact', () => {
      const wizard: WizardFacts = {
        service_name: 'Legal Services Ltd',
        service_email: 'service@legal.com',
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.service_contact.service_name).toBe('Legal Services Ltd');
      expect(result.service_contact.service_email).toBe('service@legal.com');
    });
  });

  describe('Money Claim Mapping', () => {
    test('should map solicitor costs from wizard', () => {
      const wizard: WizardFacts = {
        'case_facts.money_claim.solicitor_costs': 175,
      };

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.money_claim.solicitor_costs).toBe(175);
    });

    test('should default solicitor costs to null when missing', () => {
      const wizard: WizardFacts = {};

      const result = wizardFactsToCaseFacts(wizard);

      expect(result.money_claim.solicitor_costs).toBeNull();
    });
  });
});
