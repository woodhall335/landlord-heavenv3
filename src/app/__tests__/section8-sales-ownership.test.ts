import { readFileSync } from 'node:fs';

import { metadata as costMetadata } from '@/app/eviction-cost-uk/page';
import { metadata as serveMetadata } from '@/app/serve-section-8-notice/page';
import { metadata as templateMetadata } from '@/app/section-8-notice-template/page';
import { metadata as groundFinderMetadata } from '@/app/tools/section-8-ground-finder/page';
import { metadata as timelineMetadata } from '@/app/eviction-timeline-uk/page';
import { metadata as ground1Metadata } from '@/app/section-8-grounds/how-to-evict-a-tenant-using-ground-1/page';
import { metadata as ground12Metadata } from '@/app/section-8-grounds/how-to-evict-a-tenant-using-ground-12/page';
import { CURRENT_ENGLAND_FRAMEWORK_PAGES } from '@/lib/seo/england-current-framework-pages';
import { INTENT_PAGES } from '@/lib/seo/eviction-intent-pages';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';

describe('Section 8 search ownership and sales paths', () => {
  it('keeps Form 3A creation on the dedicated transactional page', () => {
    const form3 = CURRENT_ENGLAND_FRAMEWORK_PAGES['form-3-section-8'];

    expect(form3.ownerQueryTheme).toBe('form 3a section 8');
    expect(form3.title).toContain('Create a Section 8 Eviction Notice (Form 3A)');
    expect(form3.description).toContain('Preview before paying £39.99');
    expect(form3.primaryCta.href).toContain('/wizard/flow?');
    expect(PRODUCT_OWNER_METADATA.noticeOnly.title).toContain('Notice & Service File');
    expect(PRODUCT_OWNER_METADATA.noticeOnly.title).not.toContain('Form 3A Notice');
  });

  it('separates service-method and template-comparison intent', () => {
    expect(serveMetadata.title).toContain('How to Serve');
    expect(serveMetadata.title).toContain('Methods & Proof');
    expect(templateMetadata.title).toContain('Template vs Guided Form 3A');
  });

  it('makes the cost owner answer Section 8 notice price intent directly', () => {
    expect(costMetadata.title).toContain('How Much Does a Section 8 Notice Cost?');
    const source = readFileSync('src/app/eviction-cost-uk/page.tsx', 'utf8');
    expect(source).toContain('id="section-8-notice-cost"');
    expect(source).toContain('Create and preview Form 3A');
    expect(source).toContain('preview before payment');
  });

  it('keeps the rent-arrears owner specific to Grounds 8, 10 and 11', () => {
    const page = INTENT_PAGES['section-8-rent-arrears-eviction'];
    expect(page.title).toContain('Grounds 8, 10 & 11');
    expect(page.description).toContain('reconcile the rent schedule');
    expect(page.relatedLinks.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-8',
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-10',
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-11',
      ])
    );
  });

  it.each(['1', '10', '11', '12', '14'])(
    'sends Ground %s readers to a preselected notice builder with central pricing',
    (ground) => {
      const source = readFileSync(
        `src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-${ground}/page.tsx`,
        'utf8'
      );
      expect(source).toContain(`product=notice_only&ground=${ground}`);
      expect(source).toContain('PRODUCTS.notice_only.displayPrice');
      expect(source).toContain('preview before payment');
    }
  );

  it('targets the demonstrated Ground 1 and Ground 12 query intent explicitly', () => {
    expect(ground1Metadata.title).toContain('Section 8 Ground 1');
    expect(ground1Metadata.description).toContain('4-month notice');
    expect(ground12Metadata.title).toContain('Section 8 Ground 12');
    expect(ground12Metadata.description).toContain('2-week notice');
  });

  it('gives the timeline page a Section 8-specific owner and interactive planner', () => {
    expect(timelineMetadata.title).toContain('How Long Does a Section 8 Eviction Take?');
    const source = readFileSync('src/app/eviction-timeline-uk/page.tsx', 'utf8');
    expect(source).toContain('Section8TimelinePlanner');
    expect(source).toContain('id="section-8-timeline-planner"');
  });

  it('adds a distinct ground-finder tool without creating another generic Section 8 guide', () => {
    expect(groundFinderMetadata.title).toContain('Which Section 8 Ground Applies?');
    const finder = readFileSync('src/components/tools/section8/Section8GroundFinder.tsx', 'utf8');
    expect(finder).toContain('This provides a research starting point, not a legal conclusion.');
    expect(finder).toContain('section8_ground_finder');
    expect(CURRENT_ENGLAND_FRAMEWORK_PAGES['section-8-notice'].decisionBlock?.cards)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ href: '/tools/section-8-ground-finder' }),
      ]));
    const groundsHub = readFileSync('src/app/section-8-grounds-explained/page.tsx', 'utf8');
    expect(groundsHub).toContain("href: '/tools/section-8-ground-finder'");
  });

  it('places a preview and delayed mobile CTA on the Notice Only product page', () => {
    const productPage = readFileSync('src/app/products/notice-only/page.tsx', 'utf8');
    expect(productPage).toContain('See what the finished pack looks like');
    expect(productPage).toContain('MobileStickyProductCta');
  });
});
