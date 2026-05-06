import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function source(path: string): string {
  return readFileSync(join(root, path), 'utf8');
}

describe('money claim wizard conversion contract', () => {
  it('keeps the money claim arrears section on the shared arrears schedule engine', () => {
    const arrearsSection = source('src/components/wizard/money-claim/ArrearsSection.tsx');

    expect(arrearsSection).toContain('ArrearsScheduleStep');
    expect(arrearsSection).toContain('This schedule feeds your N1, particulars, arrears');
    expect(arrearsSection).toContain('schedule PDF, and claim total');
  });

  it('uses a roadmap and softer customer-facing section labels', () => {
    const flow = source('src/components/wizard/flows/MoneyClaimSectionFlow.tsx');

    expect(flow).toContain('Money claim roadmap');
    expect(flow).toContain("label: 'Your details'");
    expect(flow).toContain("label: 'Tenant details'");
    expect(flow).toContain('label: "What you\'re claiming"');
    expect(flow).toContain("label: 'Letter Before Claim'");
  });

  it('uses the evidence checklist instead of default upload cards', () => {
    const evidenceSection = source('src/components/wizard/money-claim/EvidenceSection.tsx');

    expect(evidenceSection).toContain('No upload needed at this stage');
    expect(evidenceSection).toContain('evidence_items');
    expect(evidenceSection).toContain('evidence_types_available');
    expect(evidenceSection).not.toContain('<UploadField');
  });
});
