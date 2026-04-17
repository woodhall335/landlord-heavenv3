import fs from 'fs';
import path from 'path';

describe('Homepage language regression', () => {
  it('removes internal-sounding homepage copy and keeps review proof aligned', () => {
    const homepage = fs.readFileSync(
      path.join(process.cwd(), 'src/components/landing/HomeContent.tsx'),
      'utf-8'
    );

    expect(homepage).not.toContain('The homepage is built to help landlords move quickly');
    expect(homepage).not.toContain('The strongest public journey is one that tells landlords what to do next');
    expect(homepage).not.toContain('The premium pass is not about making the site flashy');
    expect(homepage).not.toContain('The public site should sell the product by making the outcome feel obvious');
    expect(homepage).not.toContain('The same live review count shown across the site.');
    expect(homepage).not.toContain('The same rating and review count shown in the hero trust pill.');
    expect(homepage).not.toContain('A live count pulled from the same review counter used across the rest of the site.');
    expect(homepage).not.toContain('Good trust copy should reassure landlords quickly');

    expect(homepage).toContain("const reviewSummary = `${REVIEW_RATING}/5 | ${formattedReviewCount} reviews`;");
    expect(homepage).toContain('Average rating from landlords using Landlord Heaven.');
    expect(homepage).toContain('Reviews left by landlords who have used the product.');
    expect(homepage).not.toContain('{reviewCount}+');
  });
});
