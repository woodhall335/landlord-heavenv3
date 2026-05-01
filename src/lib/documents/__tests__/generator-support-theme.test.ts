import { describe, expect, it } from 'vitest';

import {
  applyPremiumSupportDocumentTheme,
  isOfficialMappedTemplatePath,
  isPremiumSupportingDocumentTemplatePath,
} from '../generator';

describe('support document theming', () => {
  it('identifies official mapped forms correctly', () => {
    expect(
      isOfficialMappedTemplatePath('uk/england/templates/notice_only/form_3_section8/notice.hbs')
    ).toBe(true);
    expect(isOfficialMappedTemplatePath('uk/england/templates/eviction/n5_claim.hbs')).toBe(true);
    expect(isOfficialMappedTemplatePath('uk/england/templates/money_claims/n1_claim.hbs')).toBe(
      true
    );
    expect(
      isOfficialMappedTemplatePath('uk/england/templates/section13/form_4a_notice.hbs')
    ).toBe(true);
    expect(
      isOfficialMappedTemplatePath('uk/england/templates/eviction/hearing_checklist.hbs')
    ).toBe(false);
  });

  it('identifies premium support documents correctly', () => {
    expect(
      isPremiumSupportingDocumentTemplatePath(
        'uk/england/templates/eviction/hearing_checklist.hbs'
      )
    ).toBe(true);
    expect(
      isPremiumSupportingDocumentTemplatePath('uk/england/templates/money_claims/pack_cover.hbs')
    ).toBe(true);
    expect(
      isPremiumSupportingDocumentTemplatePath(
        'uk/england/templates/notice_only/form_6a_section21/notice.hbs'
      )
    ).toBe(false);
    expect(
      isPremiumSupportingDocumentTemplatePath(
        'uk/england/templates/residential/agreement_document.hbs'
      )
    ).toBe(true);
  });

  it('adds the premium shell to full-html support documents', () => {
    const html = `
<!DOCTYPE html>
<html>
<head><title>Checklist</title></head>
<body><div class="doc-header"><h1>Hearing Checklist</h1></div></body>
</html>
    `.trim();

    const themed = applyPremiumSupportDocumentTheme(
      html,
      'uk/england/templates/eviction/hearing_checklist.hbs',
      { jurisdiction: 'England', case_id: 'support-001' }
    );

    expect(themed).toContain('class="lh-support-doc"');
    expect(themed).not.toMatch(/<body[^>]*lh-support-doc--tenancy/);
    expect(themed).toContain('lh-pack-masthead');
    expect(themed).toContain('support-001');
    expect(themed).toContain('class="lh-brand-logo"');
    expect(themed).toContain('data:image/png;base64,');
    expect(themed).toContain('.lh-brand-mark {\n  width: 168px;');
    expect(themed).toContain('border-radius: 0;');
    expect(themed).not.toContain('border-radius: 999px;');
    expect(themed).not.toContain('LANDLORDHEAVEN');
    expect(themed).not.toContain('Legal documents for landlords');
    expect(themed).not.toContain('linear-gradient');
  });

  it('still injects masthead markup when print CSS already defines the masthead class', () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>.lh-pack-masthead { display: flex; }</style>
  <title>Checklist</title>
</head>
<body><div class="doc-header"><h1>Hearing Checklist</h1></div></body>
</html>
    `.trim();

    const themed = applyPremiumSupportDocumentTheme(
      html,
      'uk/england/templates/eviction/hearing_checklist.hbs',
      { jurisdiction: 'England', case_id: 'support-002' }
    );

    const mastheadMatches = themed.match(/<div class="lh-pack-masthead"/g) ?? [];
    expect(mastheadMatches).toHaveLength(1);
    expect(themed).toContain('support-002');
    expect(themed).toContain('class="lh-brand-logo"');
  });

  it('wraps support-document fragments in the premium shell', () => {
    const fragment = '<h1>Money Claim Pack</h1><p>Support content</p>';

    const themed = applyPremiumSupportDocumentTheme(
      fragment,
      'uk/england/templates/money_claims/pack_cover.hbs',
      { jurisdiction: 'England' }
    );

    expect(themed).toContain('<!DOCTYPE html>');
    expect(themed).toContain('class="lh-support-doc"');
    expect(themed).toContain('lh-fragment-support-doc');
    expect(themed).toContain('Money Claim Pack');
    expect(themed).toContain('class="lh-brand-logo"');
    expect(themed).toContain('.lh-brand-mark {\n  width: 168px;');
    expect(themed).toContain('border-radius: 0;');
    expect(themed).not.toContain('linear-gradient');
  });

  it('leaves official forms unchanged', () => {
    const html = `
<!DOCTYPE html>
<html>
<head><title>Form 3</title></head>
<body><div class="form-header"><h1>Form 3</h1></div></body>
</html>
    `.trim();

    const themed = applyPremiumSupportDocumentTheme(
      html,
      'uk/england/templates/notice_only/form_3_section8/notice.hbs',
      { jurisdiction: 'England' }
    );

    expect(themed).toBe(html);
  });

  it('leaves official section 13 forms unchanged', () => {
    const html = `
<!DOCTYPE html>
<html>
<head><title>Form 4A</title></head>
<body><div class="form-header"><h1>Form 4A</h1></div></body>
</html>
    `.trim();

    const themed = applyPremiumSupportDocumentTheme(
      html,
      'uk/england/templates/section13/form_4a_notice.hbs',
      { jurisdiction: 'England' }
    );

    expect(themed).toBe(html);
  });

  it('themes tenancy agreements with the shared premium shell', () => {
    const html = `
<!DOCTYPE html>
<html>
<head><title>Agreement</title></head>
<body><div class="cover"><h1>Tenancy Agreement</h1></div></body>
</html>
    `.trim();

    const themed = applyPremiumSupportDocumentTheme(
      html,
      'uk/england/templates/residential/agreement_document.hbs',
      { jurisdiction: 'England', case_id: 'agreement-001' }
    );

    expect(themed).toContain('<body class="lh-support-doc lh-support-doc--tenancy">');
    expect(themed).toContain('lh-support-doc--tenancy');
    expect(themed).toContain('lh-pack-masthead');
    expect(themed).toContain('data-theme="lh-support-document-theme"');
    expect(themed).toContain('.lh-brand-mark {\n  width: 168px;');
    expect(themed).toContain('border-radius: 0;');
    expect(themed).toContain('agreement-001');
    expect(themed).toContain('class="lh-brand-logo"');
    expect(themed).not.toContain('linear-gradient');
  });

  it('applies tenancy-specific masthead sizing only to tenancy-family outputs', () => {
    const fragment = '<h1>Pre-Tenancy Checklist</h1><p>Checklist body</p>';

    const themedTenancy = applyPremiumSupportDocumentTheme(
      fragment,
      'uk/england/templates/residential/pre_tenancy_checklist_england.hbs',
      { jurisdiction: 'England', case_id: 'tenancy-001' }
    );
    const themedEviction = applyPremiumSupportDocumentTheme(
      fragment,
      'uk/england/templates/eviction/service_instructions_section_8.hbs',
      { jurisdiction: 'England', case_id: 'eviction-001' }
    );

    expect(themedTenancy).toContain('<body class="lh-support-doc lh-support-doc--tenancy">');
    expect(themedTenancy).toContain('.lh-brand-mark {\n  width: 168px;');
    expect(themedEviction).toContain('<body class="lh-support-doc">');
    expect(themedEviction).not.toMatch(/<body[^>]*lh-support-doc--tenancy/);
  });

  it('treats shared England tenancy support templates as tenancy-family outputs', () => {
    const themedChecklist = applyPremiumSupportDocumentTheme(
      '<h1>Checklist</h1>',
      '_shared/standalone/checklist_standalone.hbs',
      {
        jurisdiction: 'England',
        case_id: 'tenancy-checklist-001',
        england_tenancy_purpose: 'new_assured_tenancy',
      }
    );
    const themedDepositCertificate = applyPremiumSupportDocumentTheme(
      '<h1>Deposit Certificate</h1>',
      'uk/england/templates/deposit_protection_certificate.hbs',
      { jurisdiction: 'England', case_id: 'tenancy-deposit-001' }
    );
    const themedPrescribedInfo = applyPremiumSupportDocumentTheme(
      '<h1>Prescribed Information</h1>',
      'uk/england/templates/tenancy_deposit_information.hbs',
      { jurisdiction: 'England', case_id: 'tenancy-info-001' }
    );

    expect(themedChecklist).toContain('<body class="lh-support-doc lh-support-doc--tenancy">');
    expect(themedDepositCertificate).toContain(
      '<body class="lh-support-doc lh-support-doc--tenancy">'
    );
    expect(themedPrescribedInfo).toContain(
      '<body class="lh-support-doc lh-support-doc--tenancy">'
    );
  });
});
