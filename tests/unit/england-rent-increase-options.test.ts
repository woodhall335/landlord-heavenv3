import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('England rent increase options', () => {
  it('keeps the England MQS on section 13 only', () => {
    const yaml = fs.readFileSync(
      path.join(process.cwd(), 'config/mqs/tenancy_agreement/england.yaml'),
      'utf-8'
    );

    expect(yaml).toContain('Section 13 rent increase process (Housing Act 1988)');
    expect(yaml).not.toContain('- "RPI"');
    expect(yaml).not.toContain('- "CPI"');
    expect(yaml).not.toContain('- "Fixed review"');
  });

  it('keeps the live tenancy flow selector on section 13 only', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/wizard/flows/TenancySectionFlow.tsx'),
      'utf-8'
    );

    expect(source).toContain("options={['Section 13 rent increase process (Housing Act 1988)']}");
    expect(source).not.toContain("options={['RPI', 'CPI', 'Section 13', 'Fixed review']}");
  });
});
