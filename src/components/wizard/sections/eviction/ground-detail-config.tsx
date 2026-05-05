'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import {
  listEnglandGroundDefinitions,
  normalizeEnglandGroundCode,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';
import {
  EVICTION_HINT_CLASS,
  EVICTION_INPUT_CLASS,
  EVICTION_LABEL_CLASS,
  EVICTION_TEXTAREA_CLASS,
} from '@/components/wizard/sections/eviction/ui';

export type GroundDetailFieldType = 'text' | 'textarea' | 'date';

export interface GroundDetailFieldConfig {
  field: string;
  label: string;
  helpText: string;
  type?: GroundDetailFieldType;
  placeholder?: string;
}

export interface GroundDetailPanelConfig {
  code: EnglandGroundCode;
  title: string;
  intro: string;
  fields: GroundDetailFieldConfig[];
}

const ENGLAND_GROUND_DEFINITIONS = listEnglandGroundDefinitions();
const ENGLAND_GROUND_MAP = new Map(
  ENGLAND_GROUND_DEFINITIONS.map((ground) => [ground.code, ground] as const),
);

const ARREARS_GROUND_CODES = new Set<EnglandGroundCode>(['8', '10', '11']);

const OCCUPATION_STYLE_GROUND_CODES = new Set<EnglandGroundCode>([
  '2', '2ZA', '2ZB', '2ZC', '2ZD', '4', '4A', '5', '5A', '5B', '5C', '5E', '5F', '5G', '5H', '7', '18',
]);

const CONDUCT_GROUND_CODES = new Set<EnglandGroundCode>(['7A', '14', '14A', '14ZA']);
const DAMAGE_GROUND_CODES = new Set<EnglandGroundCode>(['13', '15']);

export function groundFactPath(code: EnglandGroundCode, field: string): string {
  return `ground_${code.toLowerCase()}.${field}`;
}

export function hasSelectedArrearsGrounds(selectedGrounds: string[]): boolean {
  return selectedGrounds.some((ground) => {
    const code = normalizeEnglandGroundCode(ground);
    return code ? ARREARS_GROUND_CODES.has(code) : false;
  });
}

export function buildGroundDetailPanelConfig(code: EnglandGroundCode): GroundDetailPanelConfig | null {
  const definition = ENGLAND_GROUND_MAP.get(code);
  if (!definition) return null;

  if (ARREARS_GROUND_CODES.has(code)) {
    return null;
  }

  if (code === '1') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us who is expected to occupy the property after possession and why the landlord is now relying on this route.',
      fields: [
        {
          field: groundFactPath(code, 'intended_occupier'),
          label: 'Who is expected to occupy the property?',
          helpText: 'Name the landlord or family member, or describe them clearly if you do not want to use a full name.',
        },
        {
          field: groundFactPath(code, 'occupier_relationship'),
          label: 'What is their relationship to the landlord?',
          helpText: 'For example: landlord, spouse, adult son, parent, or other qualifying family member.',
        },
        {
          field: groundFactPath(code, 'occupation_reason'),
          label: 'Why is possession needed for this occupation?',
          helpText: 'Summarise the factual reason calmly and specifically.',
          type: 'textarea',
          placeholder: 'For example: the landlord is returning from working abroad and intends to live in the property as their main home.',
        },
        {
          field: groundFactPath(code, 'decision_date'),
          label: 'When was the decision made?',
          helpText: 'Use the date the landlord decided to recover possession for this purpose, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'intended_start_date'),
          label: 'When is occupation expected to begin?',
          helpText: 'This helps us explain timing without over-committing.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports this ground?',
          helpText: 'List the documents or records you already have or expect to rely on.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '1A') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us why the property is to be sold and what practical steps have already been taken toward the sale.',
      fields: [
        {
          field: groundFactPath(code, 'sale_reason'),
          label: 'Why is the property being sold?',
          helpText: 'Give the practical reason for the proposed sale.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'sale_steps_taken'),
          label: 'What sale steps have already been taken?',
          helpText: 'For example: valuation, discussions with agents, marketing preparation, or lender discussions.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'decision_date'),
          label: 'When was the decision to sell made?',
          helpText: 'Use the best date available.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'intended_sale_timing'),
          label: 'What is the expected sale timetable?',
          helpText: 'A short practical summary is enough.',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports the sale intention?',
          helpText: 'List the key supporting documents or records.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '7B') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us the immigration-status basis relied on, who it affects, and the official material that supports the ground.',
      fields: [
        {
          field: groundFactPath(code, 'affected_occupiers'),
          label: 'Which occupiers are affected?',
          helpText: 'Name or describe the occupiers whose status is relied on for this ground.',
        },
        {
          field: groundFactPath(code, 'status_basis'),
          label: 'What is the current status position?',
          helpText: 'Summarise the right-to-rent or immigration issue in neutral, factual terms.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'notice_source'),
          label: 'What official notice or source material is relied on?',
          helpText: 'For example: Home Office notice, right-to-rent disqualification letter, or follow-up confirmation.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'status_check_date'),
          label: 'When was the relevant notice or check received?',
          helpText: 'Use the date of the official material or status check, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'decision_or_reference'),
          label: 'Reference or decision identifier',
          helpText: 'Include any reference number, decision date, or official identifier if available.',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What supporting evidence is available?',
          helpText: 'List the documents you can produce in support.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '9') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us where the alternative accommodation is, when it is available, and why it is said to be suitable.',
      fields: [
        {
          field: groundFactPath(code, 'alternative_address'),
          label: 'Address or description of the alternative accommodation',
          helpText: 'Use the full address if known, or enough detail to identify it.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'availability_date'),
          label: 'When will it be available?',
          helpText: 'Use the date the tenant could realistically move in, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'suitability_summary'),
          label: 'Why is it said to be suitable?',
          helpText: 'Address size, location, condition, or household fit in a practical way.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'affordability_summary'),
          label: 'What is the affordability or availability position?',
          helpText: 'Summarise rent level, funding, or any other practical point.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports this alternative accommodation?',
          helpText: 'List the documents or confirmations available.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '6' || code === '6B') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us what works are proposed, why possession is needed to carry them out, and what project material already exists.',
      fields: [
        {
          field: groundFactPath(code, 'works_description'),
          label: 'Describe the proposed works',
          helpText: 'Summarise the redevelopment, demolition, or substantial works in practical terms.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'possession_requirement_reason'),
          label: 'Why is possession needed for the works?',
          helpText: 'Explain why the works cannot reasonably proceed with the tenant in occupation.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'intended_start_date'),
          label: 'When are the works expected to start?',
          helpText: 'Use the best available date.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'planning_or_contractor_status'),
          label: 'Planning, contractor, or project status',
          helpText: 'For example: planning obtained, contractor instructed, funding approved, or quotations pending.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports the works?',
          helpText: 'List the key plans, approvals, quotations, contracts, or other project records.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '12') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us which tenancy term was breached, what happened, when it happened, and what records support the allegation.',
      fields: [
        {
          field: groundFactPath(code, 'tenancy_clause'),
          label: 'Which tenancy clause or obligation was breached?',
          helpText: 'Use the clause number if known, or describe the obligation clearly.',
        },
        {
          field: groundFactPath(code, 'breach_type'),
          label: 'What breach is relied on?',
          helpText: 'For example: unauthorised subletting, keeping a pet without consent, or refusing access.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'breach_dates'),
          label: 'When did the breach happen?',
          helpText: 'Give dates or a short chronology.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'breach_evidence'),
          label: 'What evidence supports the breach?',
          helpText: 'List the records, photographs, inspection notes, messages, or witness material available.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'warnings_issued'),
          label: 'Were warnings or requests to remedy sent?',
          helpText: 'Summarise any warning letters, emails, calls, or chances to put the breach right.',
          type: 'textarea',
        },
      ],
    };
  }

  if (DAMAGE_GROUND_CODES.has(code)) {
    const subject = code === '15' ? 'furniture or contents' : 'property';
    return {
      code,
      title: definition.title,
      intro:
        `Tell us what deterioration or damage to the ${subject} is relied on, when it was identified, and how it is evidenced.`,
      fields: [
        {
          field: groundFactPath(code, 'damage_description'),
          label: `Describe the damage or deterioration to the ${subject}`,
          helpText: 'Keep this factual and distinguish it from fair wear and tear where possible.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'damage_discovered_date'),
          label: 'When was it discovered?',
          helpText: 'Use the inspection, report, or discovery date if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'damage_cost'),
          label: 'Estimated repair or replacement cost',
          helpText: 'Use the best current estimate, quote, or invoice total if available.',
        },
        {
          field: groundFactPath(code, 'evidence_available'),
          label: 'What evidence supports this ground?',
          helpText: 'For example: inventory, photographs, inspection notes, repair quotes, or contractor reports.',
          type: 'textarea',
        },
      ],
    };
  }

  if (CONDUCT_GROUND_CODES.has(code)) {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us the conduct relied on, who was affected, and what official or witness evidence supports the case.',
      fields: [
        {
          field: groundFactPath(code, 'incidents_description'),
          label: 'Describe the incidents or behaviour',
          helpText: 'Include dates, locations, and what happened. Keep the wording factual and neutral.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'incident_count'),
          label: 'How many incidents are currently recorded?',
          helpText: 'Use the number of separate incidents in your evidence log, if known.',
        },
        {
          field: groundFactPath(code, 'affected_parties'),
          label: 'Who was affected?',
          helpText: 'For example: neighbours, staff, other occupiers, visitors, or the landlord.',
        },
        {
          field: groundFactPath(code, 'warnings_issued'),
          label: 'Warnings, interventions, or reports',
          helpText: 'Summarise warnings, police attendance, council involvement, injunctions, convictions, or other interventions.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'police_reference'),
          label: 'Police or court reference',
          helpText: 'Add a crime, incident, conviction, order, or case reference if available.',
        },
        {
          field: groundFactPath(code, 'council_reference'),
          label: 'Council or housing-management reference',
          helpText: 'Add any environmental health, ASB team, managing-agent, or housing reference if available.',
        },
      ],
    };
  }

  if (code === '17') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us what statement was false, when it was made, what the true position was, and when the issue came to light.',
      fields: [
        {
          field: groundFactPath(code, 'statement_made'),
          label: 'What false statement is relied on?',
          helpText: 'Summarise the statement made by or on behalf of the tenant.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'statement_date'),
          label: 'When was the statement made?',
          helpText: 'Use the application, reference, or tenancy-signing date if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'true_facts'),
          label: 'What was the true position?',
          helpText: 'Explain the facts said to show the statement was false.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'discovery_date'),
          label: 'When was the false statement discovered?',
          helpText: 'Use the date the landlord first had reliable evidence, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports this ground?',
          helpText: 'List application forms, references, verification records, messages, or other documents.',
          type: 'textarea',
        },
      ],
    };
  }

  if (OCCUPATION_STYLE_GROUND_CODES.has(code)) {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us the current factual basis for this specialist route, who or what qualifying occupier/category is relied on, and what documents support it.',
      fields: [
        {
          field: groundFactPath(code, 'factual_basis'),
          label: `Why is Ground ${code} said to apply?`,
          helpText: 'Summarise the statutory facts in careful, neutral prose.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'qualifying_occupier'),
          label: 'Who or what qualifying occupier/category is relied on?',
          helpText: 'For example: former employee, student cohort, minister, seasonal worker, or other qualifying category.',
        },
        {
          field: groundFactPath(code, 'occupier_relationship'),
          label: 'Relationship or status details',
          helpText: 'Explain the relationship to the landlord or the qualifying status relied on.',
        },
        {
          field: groundFactPath(code, 'trigger_date'),
          label: 'Relevant trigger or status date',
          helpText: 'Use the key date connected to the status relied on, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'notice_or_status_details'),
          label: 'Notice, status, or context details',
          helpText: 'Add any prior notice, licence terms, employment/education link, or other relevant factual detail.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports this ground?',
          helpText: 'List the key documents or records available.',
          type: 'textarea',
        },
      ],
    };
  }

  return {
    code,
    title: definition.title,
    intro:
      'Tell us why this ground is said to apply, the key dates, and the evidence that supports it.',
    fields: [
      {
        field: groundFactPath(code, 'factual_basis'),
        label: `Why is Ground ${code} said to apply?`,
        helpText: 'Summarise the statutory facts in careful, neutral prose.',
        type: 'textarea',
      },
      {
        field: groundFactPath(code, 'trigger_date'),
        label: 'Relevant trigger or event date',
        helpText: 'Use the key date connected to this ground, if known.',
        type: 'date',
      },
      {
        field: groundFactPath(code, 'notice_or_status_details'),
        label: 'Notice, status, or context details',
        helpText: 'Add any prior notice, decision, status, scheme, or factual context that explains the ground.',
        type: 'textarea',
      },
      {
        field: groundFactPath(code, 'supporting_evidence'),
        label: 'What evidence supports this ground?',
        helpText: 'List the key documents, records, or witness material available.',
        type: 'textarea',
      },
    ],
  };
}

export function getSelectedGroundDetailPanels(selectedGrounds: string[]): GroundDetailPanelConfig[] {
  return Array.from(
    new Set(
      selectedGrounds
        .map((ground) => normalizeEnglandGroundCode(ground))
        .filter((ground): ground is EnglandGroundCode => Boolean(ground)),
    ),
  )
    .map((code) => buildGroundDetailPanelConfig(code))
    .filter((panel): panel is GroundDetailPanelConfig => Boolean(panel));
}

export function hasSelectedGroundDetailPanels(selectedGrounds: string[]): boolean {
  return getSelectedGroundDetailPanels(selectedGrounds).length > 0;
}

interface Section8GroundDetailPanelsProps {
  facts: WizardFacts;
  panels: GroundDetailPanelConfig[];
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const Section8GroundDetailPanels: React.FC<Section8GroundDetailPanelsProps> = ({
  facts,
  panels,
  onUpdate,
}) => {
  if (panels.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {panels.map((panel) => (
        <section key={panel.code} className="space-y-3 rounded-[1.45rem] border border-[#e7dbff] bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-[#20103f]">
              Ground {panel.code} - {panel.title}
            </h4>
            <p className="text-sm leading-6 text-[#62597c]">{panel.intro}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {panel.fields.map((field) => {
              const value = String((facts as Record<string, any>)[field.field] || '');
              const isTextArea = field.type === 'textarea';
              const fieldId = `${panel.code}-${field.field.replace(/[^a-z0-9]+/gi, '-')}`;

              return (
                <div key={field.field} className={isTextArea ? 'space-y-1.5 md:col-span-2' : 'space-y-1.5'}>
                  <label htmlFor={fieldId} className={EVICTION_LABEL_CLASS}>
                    {field.label}
                  </label>
                  {isTextArea ? (
                    <textarea
                      id={fieldId}
                      rows={4}
                      className={`${EVICTION_TEXTAREA_CLASS} min-h-[130px]`}
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(event) => void onUpdate({ [field.field]: event.target.value })}
                    />
                  ) : (
                    <input
                      id={fieldId}
                      type={field.type || 'text'}
                      className={EVICTION_INPUT_CLASS}
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(event) => void onUpdate({ [field.field]: event.target.value })}
                    />
                  )}
                  <p className={EVICTION_HINT_CLASS}>{field.helpText}</p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
