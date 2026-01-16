/**
 * Regression tests for Notice Compliance Fields
 *
 * These tests verify that the service date and serving capacity fields
 * are correctly mapped from wizard data to template data for:
 * - Section 8 Notice (Form 3)
 * - Section 21 Notice (Form 6A)
 *
 * Compliance-critical: These fields must be correctly populated for
 * the notices to be legally valid.
 */

import { describe, expect, it } from 'vitest';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';

describe('Notice Compliance Fields - Service Date Mapping', () => {
  it('maps notice_service.notice_date to service_date and all date aliases', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      'notice_service.notice_date': '2024-06-15',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // All date aliases should be set
    expect(templateData.service_date).toBe('2024-06-15');
    expect(templateData.notice_date).toBe('2024-06-15');
    expect(templateData.notice_service_date).toBe('2024-06-15');
    expect(templateData.intended_service_date).toBe('2024-06-15');
    expect(templateData.date_of_service).toBe('2024-06-15');
    expect(templateData.served_on).toBe('2024-06-15');
  });

  it('maps notice_service_date direct key to all date aliases', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_21',
      notice_service_date: '2024-07-20',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.service_date).toBe('2024-07-20');
    expect(templateData.notice_date).toBe('2024-07-20');
    expect(templateData.notice_service_date).toBe('2024-07-20');
    expect(templateData.intended_service_date).toBe('2024-07-20');
  });

  it('prioritizes notice_service.notice_date over legacy keys', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      'notice_service.notice_date': '2024-08-01',  // Primary from MQS
      notice_service_date: '2024-07-15',            // Legacy key
      service_date: '2024-07-01',                   // Another legacy key
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Should use the MQS maps_to path
    expect(templateData.service_date).toBe('2024-08-01');
    expect(templateData.notice_date).toBe('2024-08-01');
  });

  it('Section 8: calculates earliest_possession_date from service_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 8 - Serious rent arrears'],
      notice_service_date: '2024-06-01',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      total_arrears: 2500,
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.service_date).toBe('2024-06-01');
    expect(templateData.earliest_possession_date).toBeDefined();
    expect(templateData.notice_period_days).toBe(14); // Ground 8 requires 2 weeks
  });

  it('Section 21: sets notice_expiry_date from service_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_21',
      notice_service_date: '2024-06-01',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.service_date).toBe('2024-06-01');
    // Section 21 requires 2 months notice
    expect(templateData.notice_expiry_date).toBeDefined();
  });
});

describe('Notice Compliance Fields - Serving Capacity Mapping', () => {
  it('maps serving_capacity "landlord" to boolean flags', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      'notice_service.serving_capacity': 'landlord',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBe('landlord');
    expect(templateData.is_landlord_serving).toBe(true);
    expect(templateData.is_joint_landlords_serving).toBe(false);
    expect(templateData.is_agent_serving).toBe(false);
  });

  it('maps serving_capacity "joint_landlords" to boolean flags', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_21',
      'notice_service.serving_capacity': 'joint_landlords',
      landlord_full_name: 'John and Jane Landlord',
      tenant_full_name: 'Bob Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBe('joint_landlords');
    expect(templateData.is_landlord_serving).toBe(false);
    expect(templateData.is_joint_landlords_serving).toBe(true);
    expect(templateData.is_agent_serving).toBe(false);
  });

  it('maps serving_capacity "agent" to boolean flags', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      'notice_service.serving_capacity': 'agent',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBe('agent');
    expect(templateData.is_landlord_serving).toBe(false);
    expect(templateData.is_joint_landlords_serving).toBe(false);
    expect(templateData.is_agent_serving).toBe(true);
  });

  it('normalizes served_by "Landlord" text to capacity flag', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      'notice_service.served_by': 'Landlord',  // Text input fallback
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBe('landlord');
    expect(templateData.is_landlord_serving).toBe(true);
  });

  it('normalizes served_by "Letting Agent" text to agent capacity', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_21',
      served_by: 'Letting Agent ABC Ltd',  // Direct text input
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBe('agent');
    expect(templateData.is_agent_serving).toBe(true);
  });

  it('normalizes served_by "Joint Landlord" text to joint_landlords capacity', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      notice_served_by: 'Joint Landlord',
      landlord_full_name: 'John and Mary Smith',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBe('joint_landlords');
    expect(templateData.is_joint_landlords_serving).toBe(true);
  });

  it('normalizes served_by "Solicitor" text to agent capacity', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      served_by: 'Solicitor Smith & Co',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBe('agent');
    expect(templateData.is_agent_serving).toBe(true);
  });

  it('prioritizes explicit serving_capacity over served_by text', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      'notice_service.serving_capacity': 'agent',  // Explicit selection
      'notice_service.served_by': 'John Landlord', // Name doesn't override capacity
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Should use the explicit serving_capacity, not infer from served_by
    expect(templateData.serving_capacity).toBe('agent');
    expect(templateData.is_agent_serving).toBe(true);
  });

  it('defaults to null when no capacity information provided', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      notice_service_date: '2024-06-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.serving_capacity).toBeNull();
    expect(templateData.is_landlord_serving).toBe(false);
    expect(templateData.is_joint_landlords_serving).toBe(false);
    expect(templateData.is_agent_serving).toBe(false);
  });
});

describe('Notice Compliance Fields - Combined Date and Capacity', () => {
  it('Section 8 Form 3: both service date and capacity are populated correctly', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 8 - Serious rent arrears', 'Ground 11 - Persistent delay'],
      'notice_service.notice_date': '2024-06-15',
      'notice_service.serving_capacity': 'landlord',
      'notice_service.served_by': 'John Landlord',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Test Street',
      property_address_town: 'London',
      property_postcode: 'SW1A 1AA',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      total_arrears: 3600,
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Date fields
    expect(templateData.service_date).toBe('2024-06-15');
    expect(templateData.notice_date).toBe('2024-06-15');
    expect(templateData.notice_service_date).toBe('2024-06-15');
    expect(templateData.intended_service_date).toBe('2024-06-15');

    // Capacity fields
    expect(templateData.serving_capacity).toBe('landlord');
    expect(templateData.is_landlord_serving).toBe(true);
    expect(templateData.is_joint_landlords_serving).toBe(false);
    expect(templateData.is_agent_serving).toBe(false);

    // Other required fields
    expect(templateData.landlord_full_name).toBe('John Landlord');
    expect(templateData.tenant_full_name).toBe('Jane Tenant');
    expect(templateData.grounds.length).toBe(2);
  });

  it('Section 21 Form 6A: both service date and capacity are populated correctly', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_21',
      'notice_service.notice_date': '2024-07-01',
      'notice_service.serving_capacity': 'joint_landlords',
      'notice_service.served_by': 'John and Mary Landlord',
      landlord_full_name: 'John Landlord',
      landlord_2_name: 'Mary Landlord',
      tenant_full_name: 'Bob Tenant',
      property_address_line1: '456 High Street',
      property_address_town: 'Manchester',
      property_postcode: 'M1 1AA',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Date fields
    expect(templateData.service_date).toBe('2024-07-01');
    expect(templateData.notice_date).toBe('2024-07-01');
    expect(templateData.notice_service_date).toBe('2024-07-01');
    expect(templateData.intended_service_date).toBe('2024-07-01');

    // Capacity fields
    expect(templateData.serving_capacity).toBe('joint_landlords');
    expect(templateData.is_landlord_serving).toBe(false);
    expect(templateData.is_joint_landlords_serving).toBe(true);
    expect(templateData.is_agent_serving).toBe(false);

    // Other required fields
    expect(templateData.landlord_full_name).toBe('John Landlord');
    expect(templateData.landlord_2_name).toBe('Mary Landlord');
    expect(templateData.tenant_full_name).toBe('Bob Tenant');
  });

  it('Agent serving: capacity and name are both captured', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 10 - Some rent arrears'],
      'notice_service.notice_date': '2024-08-01',
      'notice_service.serving_capacity': 'agent',
      'notice_service.served_by': 'ABC Letting Agents Ltd',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '789 Oak Road, London, SW1A 2BB',
      notice_service_date: '2024-08-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Capacity
    expect(templateData.serving_capacity).toBe('agent');
    expect(templateData.is_agent_serving).toBe(true);

    // Served by name is preserved
    expect(templateData.notice_served_by).toBe('ABC Letting Agents Ltd');
  });
});

describe('Notice Compliance Fields - Fallback Behavior', () => {
  it('uses today as fallback only when no service date provided', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_21',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
      // No service date provided
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Should have a service_date (defaulted to today)
    expect(templateData.service_date).toBeDefined();
    expect(templateData.notice_date).toBeDefined();

    // Date should be in ISO format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(templateData.service_date).toMatch(dateRegex);
  });

  it('calculates earliest_possession_date from service_date when not explicitly set', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 1 - Landlord previously occupied'], // 2 month notice
      notice_service_date: '2024-06-01',
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address: '123 Test Street',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.service_date).toBe('2024-06-01');
    expect(templateData.earliest_possession_date).toBeDefined();
    // Ground 1 requires 60 days (2 months) notice
    expect(templateData.notice_period_days).toBe(60);
  });
});
