import fs from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import {
  getTenancyAgreementLabel,
  getTenancyAskHeavenPlaceholder,
  getTenancyWizardWelcomeMessage,
  type TenancyWizardJurisdiction,
} from '@/lib/tenancy/wizard-copy';

const VISIBLE_COPY_KEYS = new Set([
  'question',
  'helperText',
  'label',
  'placeholder',
  'description',
  'suggestion_prompt',
  'section',
]);

function collectVisibleCopy(value: unknown, output: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectVisibleCopy(entry, output));
    return output;
  }

  if (!value || typeof value !== 'object') {
    return output;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (VISIBLE_COPY_KEYS.has(key) && typeof entry === 'string') {
      output.push(entry);
    }

    if (key === 'options' && Array.isArray(entry)) {
      for (const option of entry) {
        if (typeof option === 'string') {
          output.push(option);
        } else if (
          option &&
          typeof option === 'object' &&
          'label' in option &&
          typeof option.label === 'string'
        ) {
          output.push(option.label);
        }
      }
    }

    collectVisibleCopy(entry, output);
  }

  return output;
}

function loadWizardCopy(jurisdiction: string): string {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'config',
      'mqs',
      'tenancy_agreement',
      `${jurisdiction}.yaml`
    ),
    'utf8'
  );
  const parsed = yaml.load(source);

  // "Bank of England base rate" is a valid UK-wide financial reference rather
  // than England-only tenancy terminology.
  return collectVisibleCopy(parsed).join('\n').replace(/Bank of England/gi, 'central bank');
}

describe('tenancy wizard jurisdiction copy isolation', () => {
  const cases = [
    {
      jurisdiction: 'wales',
      required:
        /^(?=[\s\S]*Standard Occupation Contract)(?=[\s\S]*contract-holder)(?=[\s\S]*Cardiff)(?=[\s\S]*CF10 1AA)/i,
      shellRequired: /Standard Occupation Contract[\s\S]*contract-holder/i,
      forbidden:
        /\b(?:AST|assured shorthold|section 21|how to rent|right to rent|PRT|private residential tenancy|Northern Ireland|Scotland|Scottish|London|SW1A|W1A|tenant|tenants|tenancy|tenancies)\b/i,
    },
    {
      jurisdiction: 'scotland',
      required:
        /^(?=[\s\S]*Standard PRT)(?=[\s\S]*Scottish Private Residential Tenancy)(?=[\s\S]*Edinburgh)(?=[\s\S]*EH1 1AA)/i,
      shellRequired: /Private Residential Tenancy Agreement[\s\S]*Scotland/i,
      forbidden:
        /\b(?:AST|assured shorthold|section 21|how to rent|right to rent|occupation contract|contract-holder|Rent Smart Wales|Northern Ireland|Wales|Welsh|London|Cardiff|Belfast|SW1A|CF\d|BT\d)\b/i,
    },
    {
      jurisdiction: 'northern-ireland',
      required:
        /^(?=[\s\S]*Standard NI Private Tenancy)(?=[\s\S]*Northern Ireland)(?=[\s\S]*Belfast)(?=[\s\S]*BT1 1AA)(?=[\s\S]*Tenancy Information Notice)/i,
      shellRequired: /Private Tenancy Agreement[\s\S]*Northern Ireland/i,
      forbidden:
        /\b(?:AST|assured shorthold|section 21|how to rent|right to rent|occupation contract|contract-holder|Rent Smart Wales|Scotland|Scottish|Wales|Welsh|London|Cardiff|Edinburgh|SW1A|CF\d|EH\d)\b/i,
    },
    {
      jurisdiction: 'england',
      required:
        /^(?=[\s\S]*Standard Assured Periodic Tenancy Agreement)(?=[\s\S]*England)(?=[\s\S]*London)(?=[\s\S]*SW1A 1AA)/i,
      shellRequired: /Assured Periodic Tenancy Agreement[\s\S]*England/i,
      forbidden:
        /\b(?:occupation contract|contract-holder|Rent Smart Wales|Scotland|Scottish|Wales|Welsh|Northern Ireland|PRT|Cardiff|Edinburgh|Belfast|CF\d|EH\d|BT\d)\b/i,
    },
  ] as const;

  it.each(cases)(
    '$jurisdiction uses its own terminology and contains no other-jurisdiction copy',
    ({ jurisdiction, required, forbidden }) => {
      const copy = loadWizardCopy(jurisdiction);

      expect(copy).toMatch(required);
      expect(copy).not.toMatch(forbidden);
    }
  );

  it.each(cases)(
    '$jurisdiction keeps the shared wizard shell jurisdiction-specific',
    ({ jurisdiction, shellRequired, forbidden }) => {
      const canonicalJurisdiction = jurisdiction as TenancyWizardJurisdiction;
      const shellCopy = [
        getTenancyAgreementLabel(canonicalJurisdiction),
        getTenancyWizardWelcomeMessage(canonicalJurisdiction),
        getTenancyAskHeavenPlaceholder(canonicalJurisdiction),
      ]
        .join('\n')
        .replace(/Bank of England/gi, 'central bank');

      expect(shellCopy).toMatch(shellRequired);
      expect(shellCopy).not.toMatch(forbidden);
    }
  );
});
