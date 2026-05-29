import { describe, expect, it } from 'vitest';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { listEnglandGroundDefinitions } from '@/lib/england-possession/ground-catalog';
import {
  getSelectedGroundDetailPanels,
  hasSelectedArrearsGrounds,
  type GroundDetailPanelConfig,
} from '../ground-detail-config';
import {
  buildGroundFieldSeed,
  buildSpecialistParticularsDraft,
  buildSpecialistSectionSeed,
} from '../GroundDetailsSection';

describe('GroundDetailsSection Ask Heaven drafting context', () => {
  const allGroundSelections = listEnglandGroundDefinitions().map(
    (ground) => `Ground ${ground.code} - ${ground.title}`,
  );
  const allSpecialistPanels = getSelectedGroundDetailPanels(allGroundSelections);

  function buildFactsForPanel(panel: GroundDetailPanelConfig): WizardFacts {
    return {
      section8_grounds: [`Ground ${panel.code} - ${panel.title}`],
      property_address_line1: '129 London Street',
      property_address_town: 'London',
      property_address_postcode: 'N1 4LA',
      landlord_full_name: 'John Smith',
      tenant_full_name: 'Sarah Doe',
      notice_served_date: '2026-05-29',
      ...Object.fromEntries(
        panel.fields.map((field) => [
          field.field,
          `entered value for Ground ${panel.code}: ${field.label}`,
        ]),
      ),
    } as unknown as WizardFacts;
  }

  const selectedGrounds = ['Ground 1A - Sale of dwelling house'];
  const facts = {
    section8_grounds: selectedGrounds,
    property_address_line1: '129 London Street',
    property_address_town: 'London',
    property_address_postcode: 'N1 4LA',
    landlord_full_name: 'John Smith',
    tenant_full_name: 'Sarah Doe',
    notice_served_date: '2026-05-29',
    'ground_1a.sale_reason': 'i wanted to',
    'ground_1a.sale_steps_taken': 'agreed an offer',
    'ground_1a.decision_date': '2026-05-29',
    'ground_1a.intended_sale_timing': 'we are expected to exchange at the earliest opportunity',
    'ground_1a.supporting_evidence': 'property listing agreement from estate agent',
  } as unknown as WizardFacts;

  it('builds a Ground 1A summary from the actual sale facts, not generic arrears wording', () => {
    const panels = getSelectedGroundDetailPanels(selectedGrounds);
    const draft = buildSpecialistParticularsDraft(facts, selectedGrounds, panels);

    expect(draft).toContain('Ground 1A - Sale of dwelling house');
    expect(draft).toContain('129 London Street, London, N1 4LA');
    expect(draft).toContain('i wanted to');
    expect(draft).toContain('agreed an offer');
    expect(draft).toContain('2026-05-29');
    expect(draft).toContain('we are expected to exchange at the earliest opportunity');
    expect(draft).toContain('property listing agreement from estate agent');
    expect(draft).not.toContain('failure to pay rent');
    expect(draft).not.toContain('rent payments and correspondence');
    expect(draft).not.toContain('Notice to Leave');
  });

  it('includes every Ground 1A field and anti-generic guardrails in the AI seed', () => {
    const panels = getSelectedGroundDetailPanels(selectedGrounds);
    const seed = buildSpecialistSectionSeed(facts, selectedGrounds, panels);

    expect(seed).toContain('Ground 1A - Sale of dwelling house');
    expect(seed).toContain('Why is the property being sold?: i wanted to');
    expect(seed).toContain('What sale steps have already been taken?: agreed an offer');
    expect(seed).toContain('When was the decision to sell made?: 2026-05-29');
    expect(seed).toContain('What is the expected sale timetable?: we are expected to exchange at the earliest opportunity');
    expect(seed).toContain('What evidence supports the sale intention?: property listing agreement from estate agent');
    expect(seed).toContain('Do not describe Ground 1A as rent arrears');
  });

  it('keeps field-level drafting anchored to the current selected ground', () => {
    const [panel] = getSelectedGroundDetailPanels(selectedGrounds);
    const saleStepsField = panel.fields.find((field) => field.field === 'ground_1a.sale_steps_taken');

    expect(saleStepsField).toBeDefined();

    const seed = buildGroundFieldSeed(panel, saleStepsField!, facts, selectedGrounds);

    expect(seed).toContain('Current ground: Ground 1A - Sale of dwelling house');
    expect(seed).toContain('Ground 1A is the sale of dwelling house ground.');
    expect(seed).toContain('Why is the property being sold?: i wanted to');
    expect(seed).toContain('Do not describe Ground 1A as rent arrears');
  });

  it('creates a specialist detail panel for every non-arrears Section 8 ground', () => {
    const specialistCodes = allSpecialistPanels.map((panel) => panel.code);

    expect(specialistCodes).toEqual([
      '1',
      '1A',
      '2',
      '2ZA',
      '2ZB',
      '2ZC',
      '2ZD',
      '4',
      '4A',
      '5',
      '5A',
      '5B',
      '5C',
      '5E',
      '5F',
      '5G',
      '5H',
      '6',
      '6B',
      '7',
      '7A',
      '7B',
      '9',
      '12',
      '13',
      '14',
      '14A',
      '14ZA',
      '15',
      '17',
      '18',
    ]);
  });

  it('keeps Grounds 8, 10 and 11 out of specialist panels so the arrears schedule route handles them', () => {
    const arrearsSelections = [
      'Ground 8 - Rent arrears',
      'Ground 10 - Any rent arrears',
      'Ground 11 - Persistent arrears',
    ];

    expect(getSelectedGroundDetailPanels(arrearsSelections)).toEqual([]);
    expect(hasSelectedArrearsGrounds(arrearsSelections)).toBe(true);
  });

  it.each(allSpecialistPanels)(
    'includes every entered field in the particulars draft for Ground $code',
    (panel) => {
      const panelFacts = buildFactsForPanel(panel);
      const selectedPanelGrounds = panelFacts.section8_grounds as string[];
      const draft = buildSpecialistParticularsDraft(panelFacts, selectedPanelGrounds, [panel]);

      expect(draft).toContain(`Ground ${panel.code} - ${panel.title}`);
      expect(draft).toContain('129 London Street, London, N1 4LA');

      for (const field of panel.fields) {
        expect(draft).toContain(`entered value for Ground ${panel.code}: ${field.label}`);
      }

      if (panel.code !== '12') {
        expect(draft).not.toContain('failure to pay rent');
        expect(draft).not.toContain('rent payments and correspondence');
        expect(draft).not.toContain('Notice to Leave');
      }
    },
  );

  it.each(allSpecialistPanels)(
    'includes every entered field in the AI seed for Ground $code',
    (panel) => {
      const panelFacts = buildFactsForPanel(panel);
      const selectedPanelGrounds = panelFacts.section8_grounds as string[];
      const seed = buildSpecialistSectionSeed(panelFacts, selectedPanelGrounds, [panel]);

      expect(seed).toContain(`Ground ${panel.code} - ${panel.title}`);

      for (const field of panel.fields) {
        expect(seed).toContain(`${field.label}: entered value for Ground ${panel.code}: ${field.label}`);
      }

      if (panel.code === '1A') {
        expect(seed).toContain('Ground 1A is the sale of dwelling house ground.');
      } else {
        expect(seed).toContain(`Use the legal meaning shown by Ground ${panel.code} - ${panel.title}.`);
      }
    },
  );
});
