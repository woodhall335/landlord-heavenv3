import { describe, expect, it } from 'vitest';
import { metadata as section21ValidatorMetadata } from '@/app/tools/validators/section-21/page';
import { metadata as section8ValidatorMetadata } from '@/app/tools/validators/section-8/page';
import { metadata as section21GeneratorMetadata } from '@/app/tools/free-section-21-notice-generator/layout';
import { metadata as section8GeneratorMetadata } from '@/app/tools/free-section-8-notice-generator/layout';
import { metadata as section21TemplateMetadata } from '@/app/section-21-notice-template/page';
import { metadata as section8TemplateMetadata } from '@/app/section-8-notice-template/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('section 21/8 metadata', () => {
  it('includes Free + England in validator and generator titles', () => {
    const titles = [
      section21ValidatorMetadata.title,
      section8ValidatorMetadata.title,
      section21GeneratorMetadata.title,
      section8GeneratorMetadata.title,
    ].map(asText);

    titles.forEach((title) => {
      expect(title).toContain('Free');
      expect(title).toContain('England');
    });
  });

  it('includes England in template titles', () => {
    const titles = [
      section21TemplateMetadata.title,
      section8TemplateMetadata.title,
    ].map(asText);

    titles.forEach((title) => {
      expect(title).toContain('England');
    });
  });

  it('mentions England in validator/generator/template descriptions', () => {
    const descriptions = [
      section21ValidatorMetadata.description,
      section8ValidatorMetadata.description,
      section21GeneratorMetadata.description,
      section8GeneratorMetadata.description,
      section21TemplateMetadata.description,
      section8TemplateMetadata.description,
    ].map(asText);

    descriptions.forEach((description) => {
      expect(description).toContain('England');
    });
  });
});
