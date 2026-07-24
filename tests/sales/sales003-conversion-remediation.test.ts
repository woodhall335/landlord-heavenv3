import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');

describe('SALES-003 conversion remediation', () => {
  it('keeps rent arrears initial state deterministic and autofill-safe', () => {
    const source = read('src', 'app', 'tools', 'rent-arrears-calculator', 'page.tsx');

    expect(source).toContain("id: 'initial-rent-period'");
    expect(source).toContain('id="rent-arrears-rent-amount"');
    expect(source).toContain('name="rentAmount"');
    expect(source).toContain('id="rent-arrears-frequency"');
    expect(source).toContain('name="frequency"');
    expect(source).toContain('name={`schedule[${item.id}].dueDate`}');
    expect(source).toContain('name={`schedule[${item.id}].dueAmount`}');
    expect(source).toContain('name={`schedule[${item.id}].paidAmount`}');
    expect(source).toContain('name={`schedule[${item.id}].paymentDate`}');
  });

  it('does not put a paid HMO product offer before the checker answers', () => {
    const source = read('src', 'app', 'tools', 'hmo-license-checker', 'page.tsx');

    expect(source).toContain('showUsageCounter={false}');
    expect(source).not.toContain('secondaryCta={{');
    expect(source).not.toContain('Choose my tenancy agreement');
    expect(source).toContain('name="postcode"');
    expect(source).toContain('name="numOccupants"');
    expect(source).toContain('name="numHouseholds"');
    expect(source).toContain('name="propertyType"');
  });

  it('suppresses duplicate mid-page CTA bands on product pages only', () => {
    const source = read('src', 'components', 'marketing', 'PublicProductSalesPage.tsx');

    expect(source).toContain("analytics?.pageType !== 'product_page'");
    expect(source).toContain('shouldShowMidPageCta && content.midPageCta');
  });

  it('does not clamp blog card copy into visibly truncated snippets', () => {
    const source = read('src', 'components', 'blog', 'BlogCard.tsx');

    expect(source).not.toContain('line-clamp-2');
    expect(source).not.toContain('line-clamp-3');
  });

  it('keeps experiment allocation deterministic and kill-switchable', () => {
    const source = read('src', 'lib', 'experiments', 'sales002.ts');

    expect(source).toContain('stableBucket');
    expect(source).toContain("NEXT_PUBLIC_SALES002_CONTEXTUAL_OFFER === 'off'");
    expect(source).not.toContain('Math.random');
    expect(source).not.toContain('crypto.randomUUID');
  });

  it('keeps unsupported public authority and review-count claims out of source copy', () => {
    const filesToCheck = [
      path.join(root, 'src', 'app'),
      path.join(root, 'src', 'components'),
      path.join(root, 'src', 'lib'),
    ];
    const riskyPhrases = [
      'solicitor-approved',
      'solicitor approved',
      'court-accepted',
      'court accepted',
      'Landlord Heaven Legal Team',
      'Property Law Specialists',
      '4.8/5',
      '2,007',
      'saved me £',
      'fines avoided',
    ];

    const scan = (dir: string): string[] =>
      fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) => {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) return scan(fullPath);
          if (!/\.(ts|tsx)$/.test(entry.name)) return [];
          return [fullPath];
        });

    const offenders = filesToCheck
      .flatMap(scan)
      .filter((file) => {
        const source = fs.readFileSync(file, 'utf8');
        return riskyPhrases.some((phrase) => source.includes(phrase));
      });

    expect(offenders).toEqual([]);
  });
});
