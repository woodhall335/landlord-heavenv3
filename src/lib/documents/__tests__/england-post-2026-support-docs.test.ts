import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function readTemplate(...segments: string[]): string {
  return fs.readFileSync(path.join(repoRoot, ...segments), 'utf8');
}

describe('England Section 8 support document templates', () => {
  it('uses current Form 3 language in the service checklist', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'checklist_section_8.hbs',
    );

    expect(template).toContain('{{notice_name}}');
    expect(template).toContain('Notice expiry date');
    expect(template).toContain('Earliest proceedings date');
    expect(template).not.toContain('Form 3A');
  });

  it('uses current Form 3 language in service instructions', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'service_instructions_section_8.hbs',
    );

    expect(template).toContain('{{notice_name}}');
    expect(template).toContain('Earliest proceedings date');
    expect(template).not.toContain('Form 3A');
  });

  it('uses current Form 3 language in the court filing guide', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'court_filing_guide.hbs',
    );

    expect(template).toContain('Form 3 notice');
    expect(template).toContain('Form N5');
    expect(template).toContain('Form N119');
    expect(template).not.toContain('Form 3A');
  });

  it('uses current Form 3 language in the cover letter', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'cover_letter_to_tenant.hbs',
    );

    expect(template).toContain('Form 3 notice');
    expect(template).toContain('This letter is not the notice itself.');
    expect(template).not.toContain('Form 3A');
  });
});
