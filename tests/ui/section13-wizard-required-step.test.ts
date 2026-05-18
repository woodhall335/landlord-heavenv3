import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourcePath = join(
  process.cwd(),
  'src/components/wizard/flows/Section13WizardFlow.tsx'
);
const source = readFileSync(sourcePath, 'utf8');

describe('Section 13 wizard required step source contract', () => {
  it('requires the core rent increase facts before continuing from step one', () => {
    expect(source).toContain('Boolean(state.tenancy.propertyAddressLine1)');
    expect(source).toContain('Boolean(state.tenancy.propertyTownCity)');
    expect(source).toContain('Boolean(state.tenancy.postcodeRaw)');
    expect(source).toContain('Boolean(state.comparablesMeta.propertyType)');
    expect(source).toContain('state.tenancy.bedrooms != null');
    expect(source).toContain('state.tenancy.currentRentAmount != null');
    expect(source).toContain('state.proposal.proposedRentAmount != null');
  });

  it('disables continue with a clear step-one completion message', () => {
    expect(source).toContain('const continueDisabled =');
    expect(source).toContain('disabled={continueDisabled}');
    expect(source).toContain(
      'Complete the property address, town/city, postcode, property type, bedrooms, current rent, and target rent before continuing.'
    );
  });

  it('marks step-one inputs as required in the browser', () => {
    expect(source).toContain('required={options?.required}');
    expect(source).toContain("{ required: true })");
    expect(source).toContain('<select\n                  required');
  });
});
