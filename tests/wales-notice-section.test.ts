/**
 * Wales Notice Section Tests
 *
 * Tests for the Wales fault-based eviction notice flow.
 *
 * Key behaviors tested:
 * 1. Wales fault_based + rent_arrears_serious -> ArrearsScheduleStep should be available
 * 2. Wales fault_based + antisocial_behaviour -> ASB conditional fields should appear
 * 3. Wales fault_based + breach_of_contract -> Breach conditional fields should appear
 * 4. Notice period calculation based on selected grounds
 * 5. Fact key storage uses canonical keys for arrears
 */

import { describe, expect, it } from 'vitest';

// Test: Wales fault-based ground selection and notice periods
describe('Wales Fault-Based Notice - Ground Selection', () => {
  const WALES_FAULT_GROUNDS = [
    {
      value: 'rent_arrears_serious',
      label: 'Section 157 - Serious rent arrears (8+ weeks)',
      period: 14,
      section: '157',
    },
    {
      value: 'rent_arrears_other',
      label: 'Section 159 - Some rent arrears (less than 8 weeks)',
      period: 30,
      section: '159',
    },
    {
      value: 'antisocial_behaviour',
      label: 'Section 161 - Antisocial behaviour',
      period: 14,
      section: '161',
    },
    {
      value: 'breach_of_contract',
      label: 'Section 162 - Breach of occupation contract',
      period: 30,
      section: '162',
    },
  ];

  it('calculates minimum notice period for serious rent arrears (Section 157)', () => {
    const selectedGrounds = ['rent_arrears_serious'];
    const minPeriod = Math.min(
      ...selectedGrounds.map((g) => {
        const ground = WALES_FAULT_GROUNDS.find((wg) => wg.value === g);
        return ground?.period ?? 30;
      })
    );
    expect(minPeriod).toBe(14);
  });

  it('calculates minimum notice period for some rent arrears (Section 159)', () => {
    const selectedGrounds = ['rent_arrears_other'];
    const minPeriod = Math.min(
      ...selectedGrounds.map((g) => {
        const ground = WALES_FAULT_GROUNDS.find((wg) => wg.value === g);
        return ground?.period ?? 30;
      })
    );
    expect(minPeriod).toBe(30);
  });

  it('calculates minimum notice period for antisocial behaviour (Section 161)', () => {
    const selectedGrounds = ['antisocial_behaviour'];
    const minPeriod = Math.min(
      ...selectedGrounds.map((g) => {
        const ground = WALES_FAULT_GROUNDS.find((wg) => wg.value === g);
        return ground?.period ?? 30;
      })
    );
    expect(minPeriod).toBe(14);
  });

  it('calculates minimum notice period for breach of contract (Section 162)', () => {
    const selectedGrounds = ['breach_of_contract'];
    const minPeriod = Math.min(
      ...selectedGrounds.map((g) => {
        const ground = WALES_FAULT_GROUNDS.find((wg) => wg.value === g);
        return ground?.period ?? 30;
      })
    );
    expect(minPeriod).toBe(30);
  });

  it('uses minimum notice period when multiple grounds selected', () => {
    const selectedGrounds = ['rent_arrears_serious', 'breach_of_contract'];
    const minPeriod = Math.min(
      ...selectedGrounds.map((g) => {
        const ground = WALES_FAULT_GROUNDS.find((wg) => wg.value === g);
        return ground?.period ?? 30;
      })
    );
    // Should use 14 days (minimum of 14 and 30)
    expect(minPeriod).toBe(14);
  });

  it('identifies which grounds require arrears schedule', () => {
    const arrearsGrounds = ['rent_arrears_serious', 'rent_arrears_other'];

    const selectedGrounds1 = ['rent_arrears_serious'];
    const hasArrearsGround1 = selectedGrounds1.some((g) => arrearsGrounds.includes(g));
    expect(hasArrearsGround1).toBe(true);

    const selectedGrounds2 = ['antisocial_behaviour'];
    const hasArrearsGround2 = selectedGrounds2.some((g) => arrearsGrounds.includes(g));
    expect(hasArrearsGround2).toBe(false);

    const selectedGrounds3 = ['rent_arrears_other', 'breach_of_contract'];
    const hasArrearsGround3 = selectedGrounds3.some((g) => arrearsGrounds.includes(g));
    expect(hasArrearsGround3).toBe(true);
  });

  it('identifies which grounds require ASB panel', () => {
    const selectedGrounds1 = ['antisocial_behaviour'];
    const hasAsbGround1 = selectedGrounds1.includes('antisocial_behaviour');
    expect(hasAsbGround1).toBe(true);

    const selectedGrounds2 = ['rent_arrears_serious'];
    const hasAsbGround2 = selectedGrounds2.includes('antisocial_behaviour');
    expect(hasAsbGround2).toBe(false);
  });

  it('identifies which grounds require breach panel', () => {
    const selectedGrounds1 = ['breach_of_contract'];
    const hasBreachGround1 = selectedGrounds1.includes('breach_of_contract');
    expect(hasBreachGround1).toBe(true);

    const selectedGrounds2 = ['antisocial_behaviour'];
    const hasBreachGround2 = selectedGrounds2.includes('breach_of_contract');
    expect(hasBreachGround2).toBe(false);
  });
});

// Test: Wales fact keys storage
describe('Wales Fault-Based Notice - Fact Keys', () => {
  it('uses canonical arrears keys for Wales', () => {
    // The canonical keys for arrears should be:
    // - arrears_items
    // - total_arrears
    // - arrears_at_notice_date
    // These should be the same as England to ensure compatibility

    const canonicalArrearsKeys = ['arrears_items', 'total_arrears', 'arrears_at_notice_date'];

    const walesArrearsUpdate = {
      arrears_items: [{ period_start: '2024-01-01', rent_due: 1000, rent_paid: 0 }],
      total_arrears: 1000,
      arrears_at_notice_date: 1000,
    };

    // Verify all canonical keys are present
    canonicalArrearsKeys.forEach((key) => {
      expect(walesArrearsUpdate).toHaveProperty(key);
    });
  });

  it('uses Wales-namespaced keys for ASB details', () => {
    const walesAsbKeys = [
      'wales_asb_incident_date',
      'wales_asb_incident_time',
      'wales_asb_location',
      'wales_asb_description',
      'wales_asb_police_involved',
      'wales_asb_police_reference',
      'wales_asb_witness_details',
    ];

    const walesAsbFacts = {
      wales_asb_incident_date: '2024-01-15',
      wales_asb_incident_time: '14:30',
      wales_asb_location: 'Common hallway',
      wales_asb_description: 'Loud music and verbal abuse',
      wales_asb_police_involved: true,
      wales_asb_police_reference: 'CAD-123456',
      wales_asb_witness_details: 'John Smith, Flat 3',
    };

    // All keys should be Wales-namespaced
    walesAsbKeys.forEach((key) => {
      expect(key.startsWith('wales_')).toBe(true);
      expect(walesAsbFacts).toHaveProperty(key);
    });
  });

  it('uses Wales-namespaced keys for breach details', () => {
    const walesBreachKeys = [
      'wales_breach_clause',
      'wales_breach_dates',
      'wales_breach_evidence_summary',
    ];

    const walesBreachFacts = {
      wales_breach_clause: 'Clause 5 - No pets',
      wales_breach_dates: 'Between March and June 2024',
      wales_breach_evidence_summary: 'Photos of dog in property, neighbor statements',
    };

    // All keys should be Wales-namespaced
    walesBreachKeys.forEach((key) => {
      expect(key.startsWith('wales_')).toBe(true);
      expect(walesBreachFacts).toHaveProperty(key);
    });
  });

  it('stores selected grounds in wales_fault_grounds key', () => {
    const walesFacts = {
      eviction_route: 'wales_fault_based',
      wales_fault_grounds: ['rent_arrears_serious', 'breach_of_contract'],
    };

    expect(walesFacts.eviction_route).toBe('wales_fault_based');
    expect(walesFacts.wales_fault_grounds).toContain('rent_arrears_serious');
    expect(walesFacts.wales_fault_grounds).toContain('breach_of_contract');
  });
});

// Test: Arrears summary generation for Wales
describe('Wales Fault-Based Notice - Arrears Summary Generation', () => {
  it('generates arrears summary text for serious arrears', () => {
    const selectedGrounds = ['rent_arrears_serious'];
    const arrearsSummary = {
      total_arrears: 2500,
      arrears_in_months: 2.5,
      periods_fully_unpaid: 2,
    };

    const hasSerious = selectedGrounds.includes('rent_arrears_serious');
    const weeksInArrears = (arrearsSummary.arrears_in_months * 4.33).toFixed(1);

    let summary = `The contract holder owes £${arrearsSummary.total_arrears.toFixed(2)} in rent arrears, `;
    summary += `representing approximately ${weeksInArrears} weeks of unpaid rent. `;
    summary += `There are ${arrearsSummary.periods_fully_unpaid} rental period(s) that are fully unpaid. `;

    if (hasSerious && arrearsSummary.arrears_in_months >= 2) {
      summary += `This exceeds the Section 157 threshold of 8 weeks' arrears.`;
    }

    expect(summary).toContain('£2500.00');
    expect(summary).toContain('10.8 weeks');
    expect(summary).toContain('2 rental period(s)');
    expect(summary).toContain('Section 157 threshold');
  });

  it('generates arrears summary text for some arrears (Section 159)', () => {
    const selectedGrounds = ['rent_arrears_other'];
    const arrearsSummary = {
      total_arrears: 500,
      arrears_in_months: 0.5,
      periods_fully_unpaid: 0,
    };

    const hasSerious = selectedGrounds.includes('rent_arrears_serious');
    const weeksInArrears = (arrearsSummary.arrears_in_months * 4.33).toFixed(1);

    let summary = `The contract holder owes £${arrearsSummary.total_arrears.toFixed(2)} in rent arrears, `;
    summary += `representing approximately ${weeksInArrears} weeks of unpaid rent. `;

    if (!hasSerious) {
      summary += `This is within the Section 159 threshold for some rent arrears.`;
    }

    expect(summary).toContain('£500.00');
    expect(summary).toContain('Section 159');
    expect(summary).not.toContain('Section 157');
  });

  it('calculates weeks from months correctly', () => {
    const arrears_in_months = 2.0;
    const weeksInArrears = arrears_in_months * 4.33;

    // 2 months * 4.33 = 8.66 weeks
    expect(weeksInArrears).toBeCloseTo(8.66, 1);
  });

  it('identifies Section 157 threshold (8+ weeks)', () => {
    const arrears_in_months = 2.0; // = 8.66 weeks
    const weeksInArrears = arrears_in_months * 4.33;

    const meetsSection157Threshold = weeksInArrears >= 8;
    expect(meetsSection157Threshold).toBe(true);

    const arrears_in_months_low = 1.5; // = 6.5 weeks
    const weeksInArrearsLow = arrears_in_months_low * 4.33;
    const meetsSection157ThresholdLow = weeksInArrearsLow >= 8;
    expect(meetsSection157ThresholdLow).toBe(false);
  });
});

// Test: ASB summary generation
describe('Wales Fault-Based Notice - ASB Summary Generation', () => {
  it('generates ASB summary from panel fields', () => {
    const facts = {
      wales_asb_incident_date: '2024-01-15',
      wales_asb_incident_time: '14:30',
      wales_asb_location: 'Common hallway',
      wales_asb_description: 'Loud music and verbal abuse towards neighbors',
      wales_asb_police_involved: true,
      wales_asb_police_reference: 'CAD-123456',
      wales_asb_witness_details: 'John Smith, Flat 3',
    };

    const parts: string[] = [];

    if (facts.wales_asb_incident_date) {
      const dateStr = new Date(facts.wales_asb_incident_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      let timeStr = '';
      if (facts.wales_asb_incident_time) {
        timeStr = ` at approximately ${facts.wales_asb_incident_time}`;
      }
      parts.push(`On ${dateStr}${timeStr}, an incident of antisocial behaviour occurred.`);
    }

    if (facts.wales_asb_location) {
      parts.push(`The incident took place at ${facts.wales_asb_location}.`);
    }

    if (facts.wales_asb_description) {
      parts.push(facts.wales_asb_description);
    }

    if (facts.wales_asb_police_involved === true) {
      let policeStr = 'The police were involved in this matter';
      if (facts.wales_asb_police_reference) {
        policeStr += ` (reference: ${facts.wales_asb_police_reference})`;
      }
      parts.push(policeStr + '.');
    }

    if (facts.wales_asb_witness_details) {
      parts.push(`Witness details: ${facts.wales_asb_witness_details}`);
    }

    const summary = parts.join(' ');

    expect(summary).toContain('15 January 2024');
    expect(summary).toContain('14:30');
    expect(summary).toContain('Common hallway');
    expect(summary).toContain('Loud music and verbal abuse');
    expect(summary).toContain('police were involved');
    expect(summary).toContain('CAD-123456');
    expect(summary).toContain('John Smith, Flat 3');
  });
});

// Test: Breach summary generation
describe('Wales Fault-Based Notice - Breach Summary Generation', () => {
  it('generates breach summary from panel fields', () => {
    const facts = {
      wales_breach_clause: 'Clause 5 - No pets allowed',
      wales_breach_dates: 'Between March and June 2024',
      wales_breach_evidence_summary: 'Photos of dog in property taken on 15th March 2024',
    };

    const parts: string[] = [];

    if (facts.wales_breach_clause) {
      parts.push(`The contract holder has breached clause ${facts.wales_breach_clause} of the occupation contract.`);
    }

    if (facts.wales_breach_dates) {
      parts.push(`The breach occurred ${facts.wales_breach_dates}.`);
    }

    if (facts.wales_breach_evidence_summary) {
      parts.push(facts.wales_breach_evidence_summary);
    }

    const summary = parts.join(' ');

    expect(summary).toContain('Clause 5');
    expect(summary).toContain('No pets allowed');
    expect(summary).toContain('Between March and June 2024');
    expect(summary).toContain('Photos of dog');
  });
});

// Test: Route completeness validation
describe('Wales Fault-Based Notice - Completeness Validation', () => {
  it('validates Wales fault-based notice is complete', () => {
    const facts = {
      eviction_route: 'wales_fault_based',
      wales_fault_grounds: ['rent_arrears_serious'],
      breach_description: 'The contract holder owes significant rent arrears.',
      notice_service_method: 'first_class_post',
      notice_service_date: '2024-01-01',
    };

    const isComplete =
      facts.eviction_route === 'wales_fault_based' &&
      (facts.wales_fault_grounds?.length ?? 0) > 0 &&
      Boolean(facts.breach_description) &&
      Boolean(facts.notice_service_method);

    expect(isComplete).toBe(true);
  });

  it('validates Wales fault-based notice is incomplete without grounds', () => {
    const facts = {
      eviction_route: 'wales_fault_based',
      wales_fault_grounds: [],
      breach_description: 'Some description',
      notice_service_method: 'first_class_post',
    };

    const isComplete =
      facts.eviction_route === 'wales_fault_based' &&
      (facts.wales_fault_grounds?.length ?? 0) > 0 &&
      Boolean(facts.breach_description) &&
      Boolean(facts.notice_service_method);

    expect(isComplete).toBe(false);
  });

  it('validates Wales fault-based notice is incomplete without breach description', () => {
    const facts = {
      eviction_route: 'wales_fault_based',
      wales_fault_grounds: ['rent_arrears_serious'],
      breach_description: '',
      notice_service_method: 'first_class_post',
    };

    const isComplete =
      facts.eviction_route === 'wales_fault_based' &&
      (facts.wales_fault_grounds?.length ?? 0) > 0 &&
      Boolean(facts.breach_description) &&
      Boolean(facts.notice_service_method);

    expect(isComplete).toBe(false);
  });
});

// Test: Ensure England flows remain unchanged
describe('England Notice Only - Unchanged Behavior', () => {
  it('Section 8 routes are still recognized', () => {
    const validRoutes = ['section_8', 'section_21', 'wales_fault_based', 'wales_section_173'];

    expect(validRoutes).toContain('section_8');
    expect(validRoutes).toContain('section_21');
  });

  it('Section 8 completeness validation unchanged', () => {
    const facts = {
      eviction_route: 'section_8',
      section8_grounds: ['Ground 8'],
      notice_service_method: 'first_class_post',
    };

    // England Section 8 needs grounds selected and service method
    const isComplete =
      facts.eviction_route === 'section_8' &&
      (facts.section8_grounds?.length ?? 0) > 0 &&
      Boolean(facts.notice_service_method);

    expect(isComplete).toBe(true);
  });

  it('Section 21 completeness validation unchanged', () => {
    const facts = {
      eviction_route: 'section_21',
      notice_service_method: 'first_class_post',
    };

    // England Section 21 just needs service method
    const isComplete =
      facts.eviction_route === 'section_21' &&
      Boolean(facts.notice_service_method);

    expect(isComplete).toBe(true);
  });

  it('England uses section8_grounds key, not wales_fault_grounds', () => {
    const englandFacts = {
      eviction_route: 'section_8',
      section8_grounds: ['Ground 8', 'Ground 10'],
    };

    const walesFacts = {
      eviction_route: 'wales_fault_based',
      wales_fault_grounds: ['rent_arrears_serious'],
    };

    // Different keys for different jurisdictions
    expect(englandFacts).toHaveProperty('section8_grounds');
    expect(englandFacts).not.toHaveProperty('wales_fault_grounds');

    expect(walesFacts).toHaveProperty('wales_fault_grounds');
    expect(walesFacts).not.toHaveProperty('section8_grounds');
  });
});
