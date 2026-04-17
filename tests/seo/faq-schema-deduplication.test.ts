import fs from 'fs';
import path from 'path';

function collectTsxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectTsxFiles(fullPath);
    }

    return entry.isFile() && fullPath.endsWith('.tsx') ? [fullPath] : [];
  });
}

function getFaqSectionBlocks(content: string): string[] {
  return Array.from(
    content.matchAll(/<FAQSection[\s\S]*?(?:\/>|<\/FAQSection>)/g)
  ).map((match) => match[0]);
}

describe('FAQ schema deduplication', () => {
  it('does not combine explicit FAQ schema with schema-enabled FAQ sections in the same file', () => {
    const tsxFiles = collectTsxFiles(path.join(process.cwd(), 'src'));
    const ignoredFiles = new Set(['src/components/seo/FAQSection.tsx']);
    const violations: string[] = [];

    for (const fullPath of tsxFiles) {
      const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');

      if (ignoredFiles.has(relativePath)) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const hasExplicitFaqSchema =
        content.includes('faqPageSchema(') || content.includes('faqSchemaData');
      const faqSectionBlocks = getFaqSectionBlocks(content);

      if (!hasExplicitFaqSchema || faqSectionBlocks.length === 0) {
        continue;
      }

      const unguardedFaqSections = faqSectionBlocks.filter(
        (block) => !block.includes('includeSchema={false}')
      );

      if (unguardedFaqSections.length > 0) {
        violations.push(relativePath);
      }
    }

    expect(violations).toEqual([]);
  });
});
