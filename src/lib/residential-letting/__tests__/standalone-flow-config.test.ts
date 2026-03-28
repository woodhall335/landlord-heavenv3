import { describe, expect, it } from 'vitest';

import {
  calculateArrearsScheduleTotal,
  getResidentialStandaloneCompletionErrors,
  getResidentialStandaloneFlowConfig,
  getResidentialStandaloneVisibleSteps,
  validateArrearsScheduleRows,
} from '@/lib/residential-letting/standalone-flow-config';
import { RESIDENTIAL_LETTING_PRODUCT_SKUS } from '@/lib/residential-letting/products';

describe('residential standalone flow config', () => {
  it('defines a detailed standalone flow for all residential products', () => {
    RESIDENTIAL_LETTING_PRODUCT_SKUS.forEach((sku) => {
      const config = getResidentialStandaloneFlowConfig(sku);
      expect(config.product).toBe(sku);
      expect(config.steps.length).toBeGreaterThanOrEqual(5);
      const requiredFacts =
        typeof config.requiredFacts === 'function' ? config.requiredFacts({}) : config.requiredFacts;
      expect(requiredFacts.length).toBeGreaterThan(0);
      expect(config.reviewSummaryFields.length).toBeGreaterThan(0);
      expect(config.completionRules.length).toBeGreaterThan(0);
    });
  });

  it('validates detailed arrears schedules and computes totals', () => {
    const rows = [
      {
        due_date: '2026-01-05',
        period_covered: 'January 2026',
        amount_due: 1200,
        amount_paid: 200,
        amount_outstanding: 1000,
      },
      {
        due_date: '2026-02-05',
        period_covered: 'February 2026',
        amount_due: 1200,
        amount_paid: 0,
        amount_outstanding: 1200,
      },
    ];

    expect(validateArrearsScheduleRows(rows)).toEqual([]);
    expect(calculateArrearsScheduleTotal(rows)).toBe(2200);
  });

  it('reports completion errors for missing required standalone facts', () => {
    const errors = getResidentialStandaloneCompletionErrors('rent_arrears_letter', {
      jurisdiction: 'england',
      arrears_mode: 'detailed_schedule',
      arrears_schedule_rows: [],
    });

    expect(errors.some((error) => error.includes('Missing required fact: sender_name'))).toBe(true);
    expect(errors.some((error) => error.includes('Add at least one arrears schedule row'))).toBe(true);
  });

  it('uses premium field blocks for inspection, inventory, and schedule-led products', () => {
    const inspection = getResidentialStandaloneFlowConfig('rental_inspection_report');
    const inventory = getResidentialStandaloneFlowConfig('inventory_schedule_condition');
    const amendment = getResidentialStandaloneFlowConfig('lease_amendment');

    expect(
      inspection.steps.some((step) => step.fields?.some((field) => field.type === 'room_builder'))
    ).toBe(true);
    expect(
      inspection.steps.some((step) => step.fields?.some((field) => field.type === 'upload'))
    ).toBe(true);
    expect(
      inventory.steps.some((step) => step.fields?.some((field) => field.type === 'room_builder'))
    ).toBe(true);
    expect(
      amendment.steps.some((step) => step.fields?.some((field) => field.type === 'repeater'))
    ).toBe(true);
  });

  it('blocks renewal review after 1 May 2026 until the warning is acknowledged', () => {
    const errors = getResidentialStandaloneCompletionErrors('renewal_tenancy_agreement', {
      jurisdiction: 'england',
      property_address_line1: '12 Example Street',
      landlord_full_name: 'Jane Landlord',
      tenant_full_name: 'Alice Tenant',
      original_agreement_date: '2025-05-01',
      renewal_start_date: '2026-05-01',
      renewal_term_length: '12 months',
      new_rent_amount: 1650,
    });

    expect(
      errors.some((error) => error.includes('post-1 May 2026 renewal suitability warning'))
    ).toBe(true);
  });

  it('shows the assured-tenancy purpose and compliance steps for modern England assured products', () => {
    const visibleSteps = getResidentialStandaloneVisibleSteps('england_standard_tenancy_agreement', {
      england_tenancy_purpose: 'new_agreement',
    });

    expect(visibleSteps.some((step) => step.id === 'england_tenancy_purpose')).toBe(true);
    expect(visibleSteps.some((step) => step.id === 'england_written_information')).toBe(true);
    expect(visibleSteps.some((step) => step.id === 'england_pre_tenancy_compliance')).toBe(true);
  });

  it('uses the transition-only step for existing written England assured tenancies', () => {
    const visibleSteps = getResidentialStandaloneVisibleSteps('england_student_tenancy_agreement', {
      england_tenancy_purpose: 'existing_written_tenancy',
    });

    expect(visibleSteps.some((step) => step.id === 'england_transition_reference')).toBe(true);
    expect(visibleSteps.some((step) => step.id === 'england_assured_terms')).toBe(false);
    expect(visibleSteps.some((step) => step.id === 'england_pre_tenancy_compliance')).toBe(false);
  });

  it('keeps the lodger route outside the assured-tenancy compliance step set', () => {
    const visibleSteps = getResidentialStandaloneVisibleSteps('england_lodger_agreement', {});

    expect(visibleSteps.some((step) => step.id === 'england_tenancy_purpose')).toBe(false);
    expect(visibleSteps.some((step) => step.id === 'lodger_terms')).toBe(true);
    expect(visibleSteps.some((step) => step.id === 'england_written_information')).toBe(false);
  });

  it('uses a structured tenant builder for the modern England tenancy products', () => {
    ([
      'england_standard_tenancy_agreement',
      'england_premium_tenancy_agreement',
      'england_student_tenancy_agreement',
      'england_hmo_shared_house_tenancy_agreement',
      'england_lodger_agreement',
    ] as const).forEach((sku) => {
      const config = getResidentialStandaloneFlowConfig(sku);
      const tenantStep = config.steps.find((step) => step.id === 'tenant')
        || config.steps.find((step) => step.id === 'england_transition_reference');

      expect(tenantStep?.fields?.some((field) => field.id === 'number_of_tenants')).toBe(true);
      expect(
        tenantStep?.fields?.some((field) => field.id === 'tenants' && field.type === 'tenant_builder')
      ).toBe(true);
    });
  });

  it('captures deeper structured product-specific fields for Premium, Student, HMO, and Lodger', () => {
    const premium = getResidentialStandaloneFlowConfig('england_premium_tenancy_agreement');
    const student = getResidentialStandaloneFlowConfig('england_student_tenancy_agreement');
    const hmo = getResidentialStandaloneFlowConfig('england_hmo_shared_house_tenancy_agreement');
    const lodger = getResidentialStandaloneFlowConfig('england_lodger_agreement');

    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'management_contact_channel'))
    ).toBe(true);
    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'routine_inspection_window'))
    ).toBe(true);
    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'repair_reporting_contact'))
    ).toBe(true);
    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'check_in_documentation_expectation'))
    ).toBe(true);
    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'utilities_transfer_expectation'))
    ).toBe(true);
    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'handover_expectations'))
    ).toBe(true);
    expect(
      student.steps.some((step) => step.fields?.some((field) => field.id === 'student_move_out_keys_process'))
    ).toBe(true);
    expect(
      student.steps.some((step) => step.fields?.some((field) => field.id === 'replacement_notice_window'))
    ).toBe(true);
    expect(
      hmo.steps.some((step) => step.fields?.some((field) => field.id === 'visitor_policy'))
    ).toBe(true);
    expect(
      hmo.steps.some((step) => step.fields?.some((field) => field.id === 'fire_safety_notes'))
    ).toBe(true);
    expect(
      lodger.steps.some((step) => step.fields?.some((field) => field.id === 'guest_policy'))
    ).toBe(true);
    expect(
      lodger.steps.some((step) => step.fields?.some((field) => field.id === 'key_return_expectations'))
    ).toBe(true);
    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'tenant_improvements_allowed_with_consent'))
    ).toBe(true);
    expect(
      premium.steps.some((step) => step.fields?.some((field) => field.id === 'supported_accommodation_tenancy'))
    ).toBe(true);
  });
});
