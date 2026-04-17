import fs from 'fs';
import path from 'path';

describe('Public copy regression', () => {
  it('does not use the generic CTA phrase "View route" in public source files', () => {
    const roots = [
      path.join(process.cwd(), 'src/app'),
      path.join(process.cwd(), 'src/components'),
    ];
    const allowExt = new Set(['.ts', '.tsx']);
    const violations: string[] = [];

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
        if (text.includes('View route')) {
          violations.push(full);
        }
      }
    };

    roots.forEach(walk);
    expect(violations).toEqual([]);
  });
});
