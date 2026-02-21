import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('N325 Form PDF Files Exist', () => {
  const publicDir = path.join(process.cwd(), 'public', 'official-forms');

  it('n325-eng.pdf exists and is not empty', () => {
    const filePath = path.join(publicDir, 'n325-eng.pdf');
    expect(fs.existsSync(filePath)).toBe(true);

    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('N325A.pdf exists and is not empty', () => {
    const filePath = path.join(publicDir, 'N325A.pdf');
    expect(fs.existsSync(filePath)).toBe(true);

    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
