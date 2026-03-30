import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SampleAgreementPreview } from '@/components/tenancy/SampleAgreementPreview';

describe('SampleAgreementPreview server rendering', () => {
  it('renders crawler-visible England clause content in static HTML', () => {
    const markup = renderToStaticMarkup(<SampleAgreementPreview />);
    const plainText = markup
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    [
      'Sample agreement preview',
      'Parties',
      'Property',
      'Rent',
      'Deposit',
      'Term',
      'Repairs / responsibilities',
      'Notices / ending tenancy',
    ].forEach((text) => {
      expect(markup).toContain(text);
    });

    expect(plainText).toContain('Harbour Lettings Ltd');
    expect(plainText).toContain('Daniel Reed');
    expect(plainText.split(' ').length).toBeGreaterThan(600);
  });
});
