import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

describe('England standalone checklist transition wording', () => {
  const templatePath = path.join(
    process.cwd(),
    'config/jurisdictions/_shared/standalone/checklist_standalone.hbs'
  );
  let templateSource = '';

  beforeAll(() => {
    Handlebars.registerHelper('eq', (left: unknown, right: unknown) => left === right);
    Handlebars.registerHelper('formatUKDate', (value: unknown) => value ?? '');
    templateSource = fs.readFileSync(templatePath, 'utf-8');
  });

  it('renders the information sheet duty for existing written England tenancies', () => {
    const template = Handlebars.compile(templateSource);
    const html = template({
      jurisdiction: 'england',
      england_tenancy_purpose: 'existing_written_tenancy',
    });

    expect(html).toContain('Information Sheet 2026');
    expect(html).toContain('exact government "Renters\' Rights Act Information Sheet 2026" PDF');
    expect(html).not.toContain('How to Rent Guide (Mandatory)');
  });

  it('renders the written-information duty for existing verbal England tenancies', () => {
    const template = Handlebars.compile(templateSource);
    const html = template({
      jurisdiction: 'england',
      england_tenancy_purpose: 'existing_verbal_tenancy',
    });

    expect(html).toContain('Required written information given for the existing verbal tenancy');
    expect(html).toContain('by 31 May 2026');
    expect(html).not.toContain('How to Rent Guide (Mandatory)');
    expect(html).not.toContain('How to Rent');
  });

  it('keeps new England agreements on the generic written-information wording only', () => {
    const template = Handlebars.compile(templateSource);
    const html = template({
      jurisdiction: 'england',
      england_tenancy_purpose: 'new_agreement',
    });

    expect(html).toContain('England written information prepared for this tenancy route');
    expect(html).not.toContain('Exact Information Sheet 2026 PDF given to every named tenant');
    expect(html).not.toContain('Required written information given for the existing verbal tenancy');
    expect(html).not.toContain('How to Rent');
  });
});
