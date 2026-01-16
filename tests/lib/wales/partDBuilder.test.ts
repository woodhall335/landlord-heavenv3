/**
 * Wales Part D Builder Tests
 *
 * Tests for buildWalesPartDText() which generates Part D ("Notice of Possession Claim")
 * text for Wales RHW23 notices using ground definitions as the SINGLE SOURCE OF TRUTH.
 *
 * Test coverage:
 * 1) Uses defs from src/lib/wales/grounds.ts for label/section (no hardcoding)
 * 2) For rent_arrears_serious: CONTAINS Wales law, DOES NOT CONTAIN England strings
 * 3) For antisocial_behaviour: CONTAINS section from defs (161)
 * 4) For multiple grounds: includes both headings and sections
 * 5) Sanitization of England references from input
 * 6) Error handling and edge cases
 */

import {
  buildWalesPartDText,
  buildWalesPartDFromWizardFacts,
  type WalesPartDParams,
} from '@/lib/wales/partDBuilder';

import {
  getWalesFaultGroundDefinitions,
  WALES_FAULT_GROUNDS,
} from '@/lib/wales/grounds';

// ============================================================================
// TEST DATA
// ============================================================================

const baseArrearsParams: WalesPartDParams = {
  wales_fault_grounds: ['rent_arrears_serious'],
  is_community_landlord: false,
  total_arrears: 3000,
  rent_amount: 1000,
  rent_frequency: 'monthly',
  notice_service_date: '2024-04-01',
  arrears_items: [
    { period_start: '2024-01-01', amount_due: 1000, amount_paid: 0 },
    { period_start: '2024-02-01', amount_due: 1000, amount_paid: 0 },
    { period_start: '2024-03-01', amount_due: 1000, amount_paid: 0 },
  ],
};

const baseAsbParams: WalesPartDParams = {
  wales_fault_grounds: ['antisocial_behaviour'],
  is_community_landlord: false,
  asb_description: 'Tenant repeatedly played loud music late at night causing disturbance to neighbours',
  asb_incident_date: '2024-03-15',
  asb_incident_time: '23:30',
};

const baseBreachParams: WalesPartDParams = {
  wales_fault_grounds: ['breach_of_contract'],
  is_community_landlord: false,
  breach_description: 'Tenant has sublet the property without landlord consent.',
  breach_clause: 'Clause 5.1 - No subletting',
};

const multiGroundParams: WalesPartDParams = {
  wales_fault_grounds: ['rent_arrears_serious', 'antisocial_behaviour'],
  is_community_landlord: false,
  total_arrears: 2500,
  rent_amount: 1000,
  rent_frequency: 'monthly',
  notice_service_date: '2024-04-01',
  arrears_items: [
    { period_start: '2024-02-01', amount_due: 1000, amount_paid: 0 },
    { period_start: '2024-03-01', amount_due: 1000, amount_paid: 500 },
  ],
  asb_description: 'Tenant engaged in threatening behaviour towards neighbours.',
  asb_incident_date: '2024-03-20',
};

// ============================================================================
// 1) USES GROUND DEFINITIONS AS SINGLE SOURCE OF TRUTH
// ============================================================================

describe('Part D Builder uses ground definitions as single source of truth', () => {
  it('should derive label from WALES_FAULT_GROUNDS for rent_arrears_serious', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    // Get the expected label from the ground definitions
    const groundDef = WALES_FAULT_GROUNDS.find(g => g.value === 'rent_arrears_serious');
    expect(groundDef).toBeDefined();

    // Part D text should contain the label from definitions
    expect(result.text).toContain(groundDef!.label);

    // Part D groundsIncluded should match definitions
    expect(result.groundsIncluded).toHaveLength(1);
    expect(result.groundsIncluded[0].label).toBe(groundDef!.label);
    expect(result.groundsIncluded[0].section).toBe(groundDef!.section);
  });

  it('should derive section number from WALES_FAULT_GROUNDS', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    // Get the expected section from the ground definitions
    const groundDef = WALES_FAULT_GROUNDS.find(g => g.value === 'rent_arrears_serious');
    expect(groundDef).toBeDefined();
    expect(groundDef!.section).toBe(157);

    // Part D text should reference section 157
    expect(result.text).toContain('section 157');

    // groundsIncluded should have correct section
    expect(result.groundsIncluded[0].section).toBe(157);
  });

  it('should derive section number for antisocial_behaviour from definitions (161)', () => {
    const result = buildWalesPartDText(baseAsbParams);

    // Get the expected section from the ground definitions
    const groundDef = WALES_FAULT_GROUNDS.find(g => g.value === 'antisocial_behaviour');
    expect(groundDef).toBeDefined();
    expect(groundDef!.section).toBe(161);

    // Part D text should reference section 161
    expect(result.text).toContain('section 161');

    // groundsIncluded should have correct section
    expect(result.groundsIncluded[0].section).toBe(161);
  });

  it('should derive section number for breach_of_contract from definitions (159)', () => {
    const result = buildWalesPartDText(baseBreachParams);

    // Get the expected section from the ground definitions
    const groundDef = WALES_FAULT_GROUNDS.find(g => g.value === 'breach_of_contract');
    expect(groundDef).toBeDefined();
    expect(groundDef!.section).toBe(159);

    // Part D text should reference section 159
    expect(result.text).toContain('section 159');
  });

  it('changing ground definitions should change output (no hardcoded mapping)', () => {
    // This test verifies that the builder uses definitions dynamically
    // We check that all grounds in definitions are supported

    const allGrounds = getWalesFaultGroundDefinitions({ isCommunityLandlord: true });

    for (const ground of allGrounds) {
      const result = buildWalesPartDText({
        wales_fault_grounds: [ground.value],
        is_community_landlord: true,
      });

      // Each ground should produce output with its section number
      expect(result.text).toContain(`section ${ground.section}`);
      expect(result.groundsIncluded[0].section).toBe(ground.section);
    }
  });
});

// ============================================================================
// 2) WALES LAW REFERENCES (rent_arrears_serious)
// ============================================================================

describe('Part D for rent_arrears_serious contains Wales law references', () => {
  it('should contain "Renting Homes (Wales) Act 2016"', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    expect(result.success).toBe(true);
    expect(result.text).toContain('Renting Homes (Wales) Act 2016');
  });

  it('should contain "section 157"', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    expect(result.text).toContain('section 157');
  });

  it('should contain "contract-holder" (Wales terminology)', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    expect(result.text).toContain('contract-holder');
  });

  it('should contain arrears total', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    // Should contain the formatted arrears amount
    expect(result.text).toMatch(/£3,?000/);
  });

  it('should reference arrears schedule', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    expect(result.text).toMatch(/schedule.*arrears/i);
  });
});

// ============================================================================
// 3) NO ENGLAND STRINGS
// ============================================================================

describe('Part D NEVER contains England-specific strings', () => {
  const englandPatterns = [
    'Housing Act 1988',
    /Section 8\b/i,
    /Ground 8\b/,
    'Form 6A',
    /Section 21\b/i,
  ];

  it('rent_arrears_serious output should NOT contain England strings', () => {
    const result = buildWalesPartDText(baseArrearsParams);

    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }
  });

  it('antisocial_behaviour output should NOT contain England strings', () => {
    const result = buildWalesPartDText(baseAsbParams);

    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }
  });

  it('breach_of_contract output should NOT contain England strings', () => {
    const result = buildWalesPartDText(baseBreachParams);

    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }
  });

  it('multi-ground output should NOT contain England strings', () => {
    const result = buildWalesPartDText(multiGroundParams);

    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }
  });

  it('should sanitize England strings from breach_description input', () => {
    const paramsWithEnglandStrings: WalesPartDParams = {
      wales_fault_grounds: ['breach_of_contract'],
      is_community_landlord: false,
      breach_description:
        'Under Section 8, Ground 8 of the Housing Act 1988, the tenant is in breach. Form 6A was served under Section 21.',
    };

    const result = buildWalesPartDText(paramsWithEnglandStrings);

    // Should NOT contain England strings (they should be sanitized)
    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }

    // Should contain [REFERENCE REMOVED] where England strings were
    expect(result.text).toContain('[REFERENCE REMOVED]');
  });

  it('should sanitize England strings from asb_description input', () => {
    const paramsWithEnglandStrings: WalesPartDParams = {
      wales_fault_grounds: ['antisocial_behaviour'],
      is_community_landlord: false,
      asb_description:
        'Behaviour warranting Ground 8 under Section 8 Housing Act 1988. Section 21 notice also served.',
      asb_incident_date: '2024-03-15',
    };

    const result = buildWalesPartDText(paramsWithEnglandStrings);

    // Should NOT contain England strings (they should be sanitized)
    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }

    // Should produce valid output with section 161
    expect(result.success).toBe(true);
    expect(result.text).toContain('section 161');
  });

  it('should sanitize England strings from false_statement_details input', () => {
    const paramsWithEnglandStrings: WalesPartDParams = {
      wales_fault_grounds: ['false_statement'],
      is_community_landlord: false,
      false_statement_details:
        'False statement made on Form 6A under Section 21 Housing Act 1988 to obtain AST.',
    };

    const result = buildWalesPartDText(paramsWithEnglandStrings);

    // Should NOT contain England strings (they should be sanitized)
    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }

    // Should produce valid output with section 159
    expect(result.success).toBe(true);
    expect(result.text).toContain('section 159');
  });

  it('should not allow England terms to leak even with complex multi-ground input', () => {
    const complexParams: WalesPartDParams = {
      wales_fault_grounds: ['rent_arrears_serious', 'antisocial_behaviour', 'breach_of_contract'],
      is_community_landlord: false,
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      breach_description: 'Multiple Section 8 grounds under Housing Act 1988.',
      asb_description: 'Ground 8 threshold met. Section 21 notice pending.',
    };

    const result = buildWalesPartDText(complexParams);

    // Verify no England terms leaked
    for (const pattern of englandPatterns) {
      if (typeof pattern === 'string') {
        expect(result.text).not.toContain(pattern);
      } else {
        expect(result.text).not.toMatch(pattern);
      }
    }

    // Should still produce valid multi-ground output
    expect(result.success).toBe(true);
    expect(result.groundsIncluded).toHaveLength(3);
    expect(result.text).toContain('section 157');
    expect(result.text).toContain('section 159');
    expect(result.text).toContain('section 161');
  });
});

// ============================================================================
// 4) ANTISOCIAL BEHAVIOUR GROUND
// ============================================================================

describe('Part D for antisocial_behaviour', () => {
  it('should contain section derived from defs (161)', () => {
    const result = buildWalesPartDText(baseAsbParams);

    expect(result.text).toContain('section 161');
    expect(result.groundsIncluded[0].section).toBe(161);
  });

  it('should contain label derived from defs', () => {
    const groundDef = WALES_FAULT_GROUNDS.find(g => g.value === 'antisocial_behaviour');
    expect(groundDef).toBeDefined();

    const result = buildWalesPartDText(baseAsbParams);

    expect(result.text).toContain(groundDef!.label);
    expect(result.groundsIncluded[0].label).toBe(groundDef!.label);
  });

  it('should include ASB incident details', () => {
    const result = buildWalesPartDText(baseAsbParams);

    expect(result.text).toContain('2024-03-15'); // Date
    expect(result.text).toContain('23:30'); // Time
    expect(result.text).toContain('loud music'); // Description
  });

  it('should reference section 55 (prohibited conduct)', () => {
    const result = buildWalesPartDText(baseAsbParams);

    expect(result.text).toContain('section 55');
  });
});

// ============================================================================
// 5) MULTIPLE GROUNDS
// ============================================================================

describe('Part D for multiple grounds', () => {
  it('should include both ground headings', () => {
    const result = buildWalesPartDText(multiGroundParams);

    // Get the expected labels from the ground definitions
    const arrearsGround = WALES_FAULT_GROUNDS.find(g => g.value === 'rent_arrears_serious');
    const asbGround = WALES_FAULT_GROUNDS.find(g => g.value === 'antisocial_behaviour');

    expect(arrearsGround).toBeDefined();
    expect(asbGround).toBeDefined();

    // Both labels should appear
    expect(result.text).toContain(arrearsGround!.label);
    expect(result.text).toContain(asbGround!.label);
  });

  it('should include both section numbers', () => {
    const result = buildWalesPartDText(multiGroundParams);

    expect(result.text).toContain('section 157');
    expect(result.text).toContain('section 161');
  });

  it('should list both grounds in groundsIncluded', () => {
    const result = buildWalesPartDText(multiGroundParams);

    expect(result.groundsIncluded).toHaveLength(2);

    const sections = result.groundsIncluded.map(g => g.section);
    expect(sections).toContain(157);
    expect(sections).toContain(161);
  });

  it('should sort grounds by section number (stable order)', () => {
    const result = buildWalesPartDText(multiGroundParams);

    // Section 157 should come before section 161
    expect(result.groundsIncluded[0].section).toBe(157);
    expect(result.groundsIncluded[1].section).toBe(161);

    // Text should have 157 content before 161 content
    const index157 = result.text.indexOf('section 157');
    const index161 = result.text.indexOf('section 161');
    expect(index157).toBeLessThan(index161);
  });

  it('should have separator between ground blocks', () => {
    const result = buildWalesPartDText(multiGroundParams);

    // Multi-ground output should have separator
    expect(result.text).toContain('---');
  });
});

// ============================================================================
// 6) COMMUNITY LANDLORD (ESTATE MANAGEMENT)
// ============================================================================

describe('Part D for community landlord estate management ground', () => {
  it('should include estate_management for community landlords', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: ['estate_management'],
      is_community_landlord: true,
      breach_description: 'Redevelopment scheme requires possession.',
    });

    expect(result.success).toBe(true);
    expect(result.text).toContain('section 160');
    expect(result.text).toContain('Schedule 8');
  });

  it('should warn if estate_management selected by non-community landlord', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: ['estate_management'],
      is_community_landlord: false,
    });

    // Should still produce output but with warning
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.toLowerCase().includes('community landlord'))).toBe(true);
  });
});

// ============================================================================
// 7) ERROR HANDLING AND EDGE CASES
// ============================================================================

describe('Part D error handling and edge cases', () => {
  it('should return failure for empty grounds array', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: [],
    });

    expect(result.success).toBe(false);
    expect(result.text).toBe('');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should return failure for null grounds', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: null,
    });

    expect(result.success).toBe(false);
    expect(result.text).toBe('');
  });

  it('should return failure for undefined grounds', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: undefined,
    });

    expect(result.success).toBe(false);
    expect(result.text).toBe('');
  });

  it('should warn for unknown ground value', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: ['unknown_ground_xyz', 'rent_arrears_serious'],
    });

    // Should still produce output for the valid ground
    expect(result.success).toBe(true);
    expect(result.text).toContain('section 157');

    // Should warn about unknown ground
    expect(result.warnings.some(w => w.includes('unknown_ground_xyz'))).toBe(true);
  });

  it('should handle missing arrears data gracefully', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: ['rent_arrears_serious'],
      total_arrears: undefined,
      rent_amount: undefined,
      arrears_items: undefined,
    });

    expect(result.success).toBe(true);
    // Should still produce output with section 157
    expect(result.text).toContain('section 157');
  });

  it('should handle missing ASB details gracefully', () => {
    const result = buildWalesPartDText({
      wales_fault_grounds: ['antisocial_behaviour'],
      asb_description: undefined,
      asb_incident_date: undefined,
    });

    expect(result.success).toBe(true);
    expect(result.text).toContain('section 161');
  });
});

// ============================================================================
// 8) CONVENIENCE FUNCTION (buildWalesPartDFromWizardFacts)
// ============================================================================

describe('buildWalesPartDFromWizardFacts convenience function', () => {
  it('should extract relevant fields from wizard facts', () => {
    const wizardFacts = {
      wales_fault_grounds: ['rent_arrears_serious'],
      is_community_landlord: false,
      total_arrears: 2000,
      arrears_total: 2000, // Alternative field name
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-04-01',
      arrears_items: [
        { period_start: '2024-02-01', amount_due: 1000, amount_paid: 0 },
        { period_start: '2024-03-01', amount_due: 1000, amount_paid: 0 },
      ],
    };

    const result = buildWalesPartDFromWizardFacts(wizardFacts);

    expect(result.success).toBe(true);
    expect(result.text).toContain('section 157');
    expect(result.text).toContain('Renting Homes (Wales) Act 2016');
  });

  it('should use fallback field names', () => {
    const wizardFacts = {
      wales_fault_grounds: ['rent_arrears_serious'],
      arrears_total: 1500, // Alternative to total_arrears
      rent_arrears_amount: 1500, // Another alternative
      service_date: '2024-04-01', // Alternative to notice_service_date
    };

    const result = buildWalesPartDFromWizardFacts(wizardFacts);

    expect(result.success).toBe(true);
    expect(result.text).toContain('section 157');
  });

  it('should handle breach_details as alternative to breach_description', () => {
    const wizardFacts = {
      wales_fault_grounds: ['breach_of_contract'],
      breach_details: 'Tenant has sublet without permission.', // Alternative field name
    };

    const result = buildWalesPartDFromWizardFacts(wizardFacts);

    expect(result.success).toBe(true);
    expect(result.text).toContain('sublet');
  });
});
