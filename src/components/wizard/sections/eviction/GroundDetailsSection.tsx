'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import AskHeavenStepAutofill, { type AskHeavenStepDraftTarget } from '@/components/wizard/AskHeavenStepAutofill';
import {
  getSelectedGroundDetailPanels,
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

const ARREARS_GROUND_CODES = ['Ground 8', 'Ground 10', 'Ground 11'];

function buildGroundFieldSeed(
  panel: GroundDetailPanelConfig,
  field: GroundDetailFieldConfig,
  facts: WizardFacts,
  selectedGrounds: string[],
): string {
  const filledPanelFacts = panel.fields
    .map((panelField) => {
      const value = String((facts as Record<string, any>)[panelField.field] || '').trim();
      return value ? `${panelField.label}: ${value}` : '';
    })
    .filter(Boolean);

  const propertyAddress = [
    facts.property_address_line1,
    facts.property_address_town,
    facts.property_address_postcode,
  ]
    .filter(Boolean)
    .join(', ');

  return [
    `Selected grounds: ${selectedGrounds.join(', ') || `Ground ${panel.code}`}.`,
    propertyAddress ? `Property: ${propertyAddress}.` : '',
    facts.landlord_full_name ? `Landlord: ${facts.landlord_full_name}.` : '',
    facts.tenant_full_name ? `Tenant: ${facts.tenant_full_name}.` : '',
    facts.tenancy_start_date ? `Tenancy start date: ${facts.tenancy_start_date}.` : '',
    facts.notice_served_date ? `Notice served date: ${facts.notice_served_date}.` : '',
    `Draft a factual answer for "${field.label}" for Ground ${panel.code} - ${panel.title}.`,
    field.helpText ? `Guidance: ${field.helpText}` : '',
    filledPanelFacts.length > 0 ? `Related answers already given:\n- ${filledPanelFacts.join('\n- ')}` : '',
    'Keep the wording neutral, specific, and limited to facts that can safely be inferred from the current case answers.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildSpecialistSectionSeed(facts: WizardFacts, selectedGrounds: string[]): string {
  const propertyAddress = [
    facts.property_address_line1,
    facts.property_address_town,
    facts.property_address_postcode,
  ]
    .filter(Boolean)
    .join(', ');

  return [
    `Selected grounds: ${selectedGrounds.join(', ')}.`,
    propertyAddress ? `Property: ${propertyAddress}.` : '',
    facts.landlord_full_name ? `Landlord: ${facts.landlord_full_name}.` : '',
    facts.tenant_full_name ? `Tenant: ${facts.tenant_full_name}.` : '',
    facts.notice_served_date ? `Notice served date: ${facts.notice_served_date}.` : '',
    'Draft clear possession particulars that explain why the selected specialist grounds apply, when the key events happened, and what records support them.',
    'Do not add legal argument or invented facts. Keep the wording suitable for Form 3A and N119 particulars.',
  ]
    .filter(Boolean)
    .join('\n');
}

export const GroundDetailsSection: React.FC<GroundDetailsSectionProps> = ({
  facts,
  caseId,
  product,
  onUpdate,
}) => {
  const selectedGrounds = (facts.section8_grounds as string[]) || [];
  const panels = useMemo(() => getSelectedGroundDetailPanels(selectedGrounds), [selectedGrounds]);
  const hasArrearsGround = selectedGrounds.some((ground) =>
    ARREARS_GROUND_CODES.some((arrearsGround) => ground.includes(arrearsGround)),
  );
  const shouldShowGeneralParticulars = panels.length > 0 && !hasArrearsGround;
  const particularsText = String(facts.section8_details || '');

  const draftTargets = useMemo<AskHeavenStepDraftTarget[]>(() => {
    const panelTargets = panels.flatMap((panel) =>
      panel.fields
        .filter((field) => field.type !== 'date')
        .map((field) => ({
          id: field.field,
          currentValue: String((facts as Record<string, any>)[field.field] || ''),
          questionText: `${field.label} for Ground ${panel.code} - ${panel.title}`,
          seedAnswer: buildGroundFieldSeed(panel, field, facts, selectedGrounds),
          apply: (text: string) => onUpdate({ [field.field]: text }),
        })),
    );

    if (!shouldShowGeneralParticulars) {
      return panelTargets;
    }

    return [
      ...panelTargets,
      {
        id: 'section8_details',
        currentValue: particularsText,
        questionText: 'Possession particulars for the selected specialist Section 8 grounds',
        seedAnswer: buildSpecialistSectionSeed(facts, selectedGrounds),
        apply: (text: string) => onUpdate({ section8_details: text }),
      },
    ];
  }, [facts, onUpdate, panels, particularsText, selectedGrounds, shouldShowGeneralParticulars]);

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

      <AskHeavenStepAutofill
        caseId={caseId}
        jurisdiction="england"
        product={product}
        buttonLabel="Draft these ground details for me"
        helperText="Ask Heaven will fill blank ground-detail fields only, using the grounds you selected and the facts already in your case."
        emptyStateText="The specialist-ground writing fields already have content. You can edit them manually or refine them later."
        targets={draftTargets}
      />

      <Section8GroundDetailPanels facts={facts} panels={panels} onUpdate={onUpdate} />

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
              context={{
                jurisdiction: 'england',
                selected_grounds: selectedGrounds,
                product,
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
