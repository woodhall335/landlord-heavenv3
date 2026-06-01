'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import AskHeavenStepAutofill, { type AskHeavenStepDraftTarget } from '@/components/wizard/AskHeavenStepAutofill';
import {
  getSelectedGroundDetailPanels,
  hasSelectedArrearsGrounds,
  Section8GroundDetailPanels,
  type GroundDetailPanelConfig,
  type GroundDetailFieldConfig,
} from './ground-detail-config';

interface GroundDetailsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  caseId: string;
  product: 'notice_only' | 'complete_pack';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

function readFactString(facts: WizardFacts, path: string): string {
  const factRecord = facts as Record<string, any>;
  const directValue = factRecord[path];
  if (directValue !== undefined && directValue !== null && String(directValue).trim()) {
    return String(directValue).trim();
  }

  const nestedValue = path
    .split('.')
    .reduce<any>((value, key) => (value && typeof value === 'object' ? value[key] : undefined), facts as any);

  return nestedValue === undefined || nestedValue === null ? '' : String(nestedValue).trim();
}

function buildPropertyAddress(facts: WizardFacts): string {
  return [
    facts.property_address_line1,
    facts.property_address_town,
    facts.property_address_postcode,
  ]
    .filter(Boolean)
    .join(', ');
}

function buildGroundFactLines(
  panel: GroundDetailPanelConfig,
  facts: WizardFacts,
  includeMissing = false,
): string[] {
  return panel.fields
    .map((panelField) => {
      const value = readFactString(facts, panelField.field);
      if (!value && !includeMissing) {
        return '';
      }

      return `${panelField.label}: ${value || 'not recorded'}`;
    })
    .filter(Boolean);
}

export function buildGroundDetailsContext(
  panels: GroundDetailPanelConfig[],
  facts: WizardFacts,
): Record<string, any> {
  return {
    selected_ground_details: panels.map((panel) => ({
      code: panel.code,
      title: panel.title,
      intro: panel.intro,
      facts: Object.fromEntries(
        panel.fields.map((field) => [
          field.field,
          {
            label: field.label,
            value: readFactString(facts, field.field) || null,
            helpText: field.helpText,
          },
        ]),
      ),
    })),
  };
}

function buildGroundContextBlock(
  panels: GroundDetailPanelConfig[],
  facts: WizardFacts,
  includeMissing = false,
): string {
  return panels
    .map((panel) => {
      const factLines = buildGroundFactLines(panel, facts, includeMissing);

      return [
        `Ground ${panel.code} - ${panel.title}`,
        panel.intro,
        factLines.length > 0 ? factLines.map((line) => `- ${line}`).join('\n') : '- No ground-specific facts recorded yet.',
      ].join('\n');
    })
    .join('\n\n');
}

function buildGroundSpecificRules(panel: GroundDetailPanelConfig): string[] {
  if (panel.code === '1A') {
    return [
      'Ground 1A is the sale of dwelling house ground.',
      'For Ground 1A, focus on the landlord intention to sell, sale reason, sale steps, decision date, timetable, and sale evidence.',
      'Do not describe Ground 1A as rent arrears, breach of tenancy, failure to pay rent, failure to leave after a Notice to Leave, or non-compliance unless another selected ground and recorded facts specifically support that.',
    ];
  }

  return [
    `Use the legal meaning shown by Ground ${panel.code} - ${panel.title}.`,
    'Do not substitute a different Section 8 ground or generic rent arrears wording.',
  ];
}

function isFieldWorthDrafting(field: GroundDetailFieldConfig): boolean {
  return field.type !== 'date';
}

export function buildGroundFieldSeed(
  panel: GroundDetailPanelConfig,
  field: GroundDetailFieldConfig,
  facts: WizardFacts,
  selectedGrounds: string[],
): string {
  const filledPanelFacts = buildGroundFactLines(panel, facts);
  const propertyAddress = buildPropertyAddress(facts);

  return [
    `Selected grounds: ${selectedGrounds.join(', ') || `Ground ${panel.code}`}.`,
    `Current ground: Ground ${panel.code} - ${panel.title}.`,
    propertyAddress ? `Property: ${propertyAddress}.` : '',
    facts.landlord_full_name ? `Landlord: ${facts.landlord_full_name}.` : '',
    facts.tenant_full_name ? `Tenant: ${facts.tenant_full_name}.` : '',
    facts.tenancy_start_date ? `Tenancy start date: ${facts.tenancy_start_date}.` : '',
    facts.notice_served_date ? `Notice served date: ${facts.notice_served_date}.` : '',
    ...buildGroundSpecificRules(panel),
    `Draft a factual answer for "${field.label}" for Ground ${panel.code} - ${panel.title}.`,
    field.helpText ? `Guidance: ${field.helpText}` : '',
    filledPanelFacts.length > 0 ? `Related answers already given:\n- ${filledPanelFacts.join('\n- ')}` : '',
    field.type === 'textarea'
      ? 'Keep the wording neutral, specific, and limited to facts that can safely be inferred from the current case answers.'
      : 'Keep this answer short. Do not turn it into a paragraph and do not say that information is unspecified.',
    'Do not invent dates, completed sale steps, agent discussions, buyer interest, documents, or a timetable unless they are already recorded in the case answers.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildSpecialistSectionSeed(
  facts: WizardFacts,
  selectedGrounds: string[],
  panels: GroundDetailPanelConfig[],
): string {
  const propertyAddress = buildPropertyAddress(facts);

  return [
    `Selected grounds: ${selectedGrounds.join(', ')}.`,
    propertyAddress ? `Property: ${propertyAddress}.` : '',
    facts.landlord_full_name ? `Landlord: ${facts.landlord_full_name}.` : '',
    facts.tenant_full_name ? `Tenant: ${facts.tenant_full_name}.` : '',
    facts.notice_served_date ? `Notice served date: ${facts.notice_served_date}.` : '',
    'Ground-specific facts recorded in this wizard:',
    buildGroundContextBlock(panels, facts, true),
    ...panels.flatMap((panel) => buildGroundSpecificRules(panel)),
    'Draft clear possession particulars that explain why the selected specialist grounds apply, when the key events happened, and what records support them.',
    'Use the ground-specific facts above. Do not replace them with generic arrears, breach, or Notice to Leave wording.',
    'Do not add legal argument or invented facts. If a field is missing, say it is not recorded instead of guessing. Keep the wording suitable for Form 3A and N119 particulars.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildSpecialistParticularsDraft(
  facts: WizardFacts,
  selectedGrounds: string[],
  panels: GroundDetailPanelConfig[],
): string {
  const propertyAddress = buildPropertyAddress(facts);
  const parties = [
    propertyAddress ? `Property: ${propertyAddress}.` : '',
    facts.landlord_full_name ? `Landlord: ${facts.landlord_full_name}.` : '',
    facts.tenant_full_name ? `Tenant: ${facts.tenant_full_name}.` : '',
    facts.notice_served_date ? `Notice service date recorded: ${facts.notice_served_date}.` : '',
  ].filter(Boolean);

  const groundParagraphs = panels.map((panel) => {
    if (panel.code === '1A') {
      const saleReason = readFactString(facts, 'ground_1a.sale_reason');
      const saleSteps = readFactString(facts, 'ground_1a.sale_steps_taken');
      const decisionDate = readFactString(facts, 'ground_1a.decision_date');
      const saleTiming = readFactString(facts, 'ground_1a.intended_sale_timing');
      const supportingEvidence = readFactString(facts, 'ground_1a.supporting_evidence');

      return [
        `Ground 1A - ${panel.title} is relied on because the landlord intends to sell the dwelling house${propertyAddress ? ` at ${propertyAddress}` : ''}.`,
        saleReason ? `The recorded reason for the sale is: ${saleReason}.` : 'The reason for the proposed sale has not yet been recorded.',
        saleSteps ? `Steps already taken toward the sale: ${saleSteps}.` : 'Steps already taken toward the sale have not yet been recorded.',
        decisionDate ? `The decision to sell was made on ${decisionDate}.` : 'The decision date has not yet been recorded.',
        saleTiming ? `Expected sale timetable: ${saleTiming}.` : 'The expected sale timetable has not yet been recorded.',
        supportingEvidence ? `Supporting evidence recorded: ${supportingEvidence}.` : 'Supporting sale evidence has not yet been recorded.',
      ].join(' ');
    }

    const factLines = buildGroundFactLines(panel, facts);
    return [
      `Ground ${panel.code} - ${panel.title} is relied on.`,
      factLines.length > 0
        ? factLines.join('. ') + '.'
        : 'The ground-specific facts for this ground have not yet been recorded.',
    ].join(' ');
  });

  return [
    selectedGrounds.length > 0 ? `Selected grounds: ${selectedGrounds.join(', ')}.` : '',
    parties.join(' '),
    groundParagraphs.join('\n\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export const GroundDetailsSection: React.FC<GroundDetailsSectionProps> = ({
  facts,
  caseId,
  product,
  onUpdate,
}) => {
  const selectedGrounds = useMemo(
    () => (Array.isArray(facts.section8_grounds) ? (facts.section8_grounds as string[]) : []),
    [facts.section8_grounds],
  );
  const panels = useMemo(() => getSelectedGroundDetailPanels(selectedGrounds), [selectedGrounds]);
  const hasArrearsGround = hasSelectedArrearsGrounds(selectedGrounds);
  const shouldShowGeneralParticulars = panels.length > 0 && !hasArrearsGround;
  const particularsText = String(facts.section8_details || '');
  const groundDetailsContext = useMemo(() => buildGroundDetailsContext(panels, facts), [facts, panels]);

  const draftTargets = useMemo<AskHeavenStepDraftTarget[]>(() => {
    return panels.flatMap((panel) =>
      panel.fields
        .filter(isFieldWorthDrafting)
        .map((field) => ({
          id: field.field,
          currentValue: readFactString(facts, field.field),
          questionText: `${field.label} for Ground ${panel.code} - ${panel.title}`,
          seedAnswer: buildGroundFieldSeed(panel, field, facts, selectedGrounds),
          context: groundDetailsContext,
          apply: (text: string) => onUpdate({ [field.field]: text }),
        })),
    );
  }, [facts, groundDetailsContext, onUpdate, panels, selectedGrounds]);

  if (panels.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,255,0.94))] p-5 shadow-[0_14px_34px_rgba(76,29,149,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f54c8]">Ground details</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#20103f]">Anchor the specialist grounds to the facts</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#60597a]">
          Keep this step focused on what happened, when it happened, why each specialist ground is relied on, and what records support it.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedGrounds.map((ground) => (
            <span
              key={ground}
              className="rounded-full border border-[#ddd0ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#5b36b3] shadow-sm"
            >
              {ground}
            </span>
          ))}
        </div>
      </section>

      <Section8GroundDetailPanels facts={facts} panels={panels} onUpdate={onUpdate} />

      <AskHeavenStepAutofill
        caseId={caseId}
        jurisdiction="england"
        product={product}
        buttonLabel="Draft these ground details for me"
        helperText="Fill in the dates and any short factual answers you already know first. Ask Heaven will then fill blank written fields from those facts."
        emptyStateText="The specialist-ground writing fields already have content. You can edit them manually or refine them later."
        targets={draftTargets}
        applyAll={(updates) => onUpdate(updates)}
      />

      {shouldShowGeneralParticulars && (
        <section className="rounded-[1.45rem] border border-[#e7dbff] bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f54c8]">Ground summary</p>
            <h4 className="text-base font-semibold text-[#20103f]">Section 8 particulars for these grounds</h4>
            <p className="text-sm leading-6 text-[#62597c]">
              Pull the selected specialist grounds into one short factual summary that can feed the Form 3A notice and the N119 claim particulars.
            </p>
          </div>
          <textarea
            id="ground-details-section8-details"
            rows={6}
            className="mt-4 min-h-[180px] w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
            value={particularsText}
            onChange={(event) => void onUpdate({ section8_details: event.target.value })}
            placeholder="Summarise the factual basis for the selected grounds, when the key events happened, and what records support them."
          />
          <p className="mt-2 text-xs leading-5 text-[#62597c]">
            Keep the wording factual and grounded in the events you have recorded above.
          </p>
          <div className="mt-3">
            <AskHeavenInlineEnhancer
              caseId={caseId}
              questionId="section8_details"
              questionText="Possession particulars for the selected specialist Section 8 grounds"
              answer={particularsText}
              onApply={(newText) => void onUpdate({ section8_details: newText })}
              showWhenEmptyWithSeed
              emptyAnswerSeed={buildSpecialistSectionSeed(facts, selectedGrounds, panels)}
              buttonLabel={particularsText.trim() ? 'Enhance with Ask Heaven' : 'Draft with Ask Heaven'}
              helperText={particularsText.trim()
                ? 'AI will improve clarity and court-readiness'
                : 'Ask Heaven will draft this summary from the ground details above'
              }
              context={{
                jurisdiction: 'england',
                selected_grounds: selectedGrounds,
                product,
                ...groundDetailsContext,
                section8_details_seed: buildSpecialistSectionSeed(facts, selectedGrounds, panels),
              }}
              apiMode="generic"
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default GroundDetailsSection;
