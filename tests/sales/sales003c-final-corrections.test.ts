import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('SALES-003C final corrections', () => {
  it('ships the genuine Ground 1A checklist and disables route prefetch for the PDF', () => {
    const pdfPath = path.join(root, 'public/checklists/ground-1a.pdf');
    const pdf = fs.readFileSync(pdfPath);
    const page = read(
      'src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-1a/page.tsx'
    );
    const preview = read('src/components/seo/ChecklistPreview.tsx');

    expect(pdf.length).toBeGreaterThan(100_000);
    expect(pdf.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(page).toContain('const checklistPdf = "/checklists/ground-1a.pdf"');
    expect(page).toContain('Download the ungated Ground 1A PDF checklist.');
    expect(preview).toContain('prefetch={false}');
  });

  it('keeps product-only detail outside UniversalHero', () => {
    const source = read('src/components/marketing/PublicProductSalesPage.tsx');

    expect(source).toContain("analytics?.pageType === 'product_page' ? null : content.hero.children");
    expect(source).toContain('data-product-decision-details');
    expect(source).toContain(
      "analytics?.pageType === 'product_page' ? false : content.hero.showTrustPositioningBar"
    );
    expect(source).toContain(
      "analytics?.pageType === 'product_page' ? false : content.hero.showUsageCounter"
    );
  });

  it('places the HMO form immediately after the concise hero and disclaimer on mobile', () => {
    const source = read('src/app/tools/hmo-license-checker/page.tsx');
    const heroStart = source.indexOf('<UniversalHero');
    const hero = source.slice(heroStart, source.indexOf('/>', heroStart) + 2);
    const checkerIndex = source.indexOf('id="checker"');
    const disclaimerIndex = source.indexOf('Legal Disclaimer Banner');

    expect(hero).not.toContain('primaryCta=');
    expect(hero).not.toContain('showTrustPositioningBar');
    expect(disclaimerIndex).toBeGreaterThan(source.indexOf('<UniversalHero'));
    expect(checkerIndex).toBeGreaterThan(disclaimerIndex);
  });

  it('keeps the rent arrears initial server render independent of the build date', () => {
    const source = read('src/app/tools/rent-arrears-calculator/page.tsx');

    expect(source).toMatch(/id: 'initial-rent-period',[\s\S]*?dueDate: '',/);
    expect(source).toContain("item.id === 'initial-rent-period' && !item.dueDate");
  });

  it('uses constraint-scoped legacy storage aliases without losing canonical event identity', () => {
    const route = read('src/app/api/analytics/events/route.ts');

    expect(route).toContain("error?.code === '23514'");
    expect(route).toContain("contextual_offer_view: 'commercial_bridge_viewed'");
    expect(route).toContain("product_primary_cta_click: 'product_cta_clicked'");
    expect(route).toContain('canonicalEventName: event.eventName');
    expect(route).toContain('persistedEventName');
  });
});
