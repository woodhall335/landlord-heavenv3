import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { WIZARD_JURISDICTION_ARTWORK } from './jurisdictionArtwork';

describe('wizard jurisdiction artwork', () => {
  it('provides an existing regional asset for every supported jurisdiction', () => {
    for (const [jurisdiction, artwork] of Object.entries(WIZARD_JURISDICTION_ARTWORK)) {
      expect(artwork.label, jurisdiction).toBeTruthy();
      expect(artwork.left || artwork.right, jurisdiction).toBeTruthy();

      for (const asset of [artwork.left, artwork.right].filter(Boolean) as string[]) {
        expect(fs.existsSync(path.join(process.cwd(), 'public', asset)), `${jurisdiction}: ${asset}`).toBe(true);
      }
    }
  });

  it('uses both supplied Wales illustrations in their requested positions', () => {
    expect(WIZARD_JURISDICTION_ARTWORK.wales).toMatchObject({
      left: '/images/wizard-wales-occupation-contract.png',
      right: '/images/wizard-wales.png',
    });
  });
});
