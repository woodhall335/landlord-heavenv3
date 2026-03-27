import fs from 'fs';
import path from 'path';

describe('Trust copy regressions', () => {
  it('rejects stale high anchor prices for complete pack and money claim across app surfaces', () => {
    const roots = ['src/app', 'src/components', 'src/lib'];
    const allowExt = new Set(['.ts', '.tsx']);
    const violations: string[] = [];
    const staleRules: Array<{ label: string; pattern: RegExp }> = [
      { label: 'Complete Pack £199.99', pattern: /Complete(?: Eviction)? Pack[^\n£]{0,120}£199\.99/i },
      { label: 'Money Claim £99.99', pattern: /Money Claim(?:s)?[^\n£]{0,120}£99\.99/i },
    ];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '__tests__') continue;
          walk(full);
          continue;
        }
        if (!allowExt.has(path.extname(entry.name))) continue;
        const text = fs.readFileSync(full, 'utf-8');
        for (const rule of staleRules) {
          if (rule.pattern.test(text)) violations.push(`${full}: ${rule.label}`);
        }
      }
    };

    roots.forEach(walk);
    expect(violations).toEqual([]);
  });

  it('homepage and wizard entrypoints call out Northern Ireland tenancy-only support up front', () => {
    const homepage = fs.readFileSync(
      path.join(process.cwd(), 'src/components/landing/HomeContent.tsx'),
      'utf-8'
    );
    const wizard = fs.readFileSync(
      path.join(process.cwd(), 'src/app/(app)/wizard/WizardClientPage.tsx'),
      'utf-8'
    );

    expect(homepage).toContain(
      'Northern Ireland properties currently support tenancy agreements only.'
    );
    expect(homepage).toContain(
      'Eviction notices and money claim packs are not currently live for NI.'
    );

    expect(wizard).toContain(
      'Northern Ireland properties currently support tenancy agreements only.'
    );
    expect(wizard).toContain(
      'Different rules apply in each jurisdiction. Northern Ireland shows a tenancy-agreements-only note on eviction and money-claim entry paths.'
    );
    expect(wizard).toContain(
      'Tenancy agreements only'
    );
    expect(wizard).toContain(
      'If you continue from an eviction or money-claim entry point, we’ll switch you to the tenancy agreement flow.'
    );
  });

  it('legacy homepage redesign keeps Northern Ireland messaging aligned', () => {
    const redesign = fs.readFileSync(
      path.join(process.cwd(), 'src/app/page-redesign.tsx'),
      'utf-8'
    );

    expect(redesign).toContain(
      'Northern Ireland currently supports tenancy agreements only.'
    );
    expect(redesign).toContain('Tenancy agreements only');
    expect(redesign).toContain('Eviction notices not yet live');
    expect(redesign).toContain('Money claims not yet live');
    expect(redesign).toContain('availability differs by product');
  });
});


