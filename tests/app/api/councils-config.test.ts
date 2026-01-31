import councilsData from '@/config/jurisdictions/uk/england/councils.json';

/**
 * Regression guard: ensure councils config resolves via the @/config alias
 * and contains representative metadata and council records.
 */
describe('England councils config resolution', () => {
  it('loads metadata and council entries', () => {
    expect(councilsData.metadata.jurisdiction).toBe('England & Wales');
    expect(councilsData.councils).toBeInstanceOf(Array);
    expect(councilsData.councils.length).toBeGreaterThanOrEqual(8);

    const regions = new Set(councilsData.councils.map((council) => council.region));
    expect(regions.has('London')).toBe(true);
  });
});
