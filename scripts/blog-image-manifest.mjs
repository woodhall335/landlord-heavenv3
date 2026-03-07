#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const HERO_DIR = path.join(repoRoot, 'public/images/blog/heroes');
const OG_DIR = path.join(repoRoot, 'public/images/blog/og');
const PLACEHOLDER_DIR = path.join(repoRoot, 'public/images/blog/placeholders');
const OUTPUT_PATH = path.join(repoRoot, 'public/images/blog/blog-image-manifest.json');

const HERO_REGEX = /^lh-blog-([a-z0-9-]+)-v1\.webp$/;
const OG_REGEX = /^lh-blog-([a-z0-9-]+)-v1-og\.webp$/;
const PLACEHOLDER_REGEX = /^lh-blog-placeholder-v(\d+)\.webp$/;
const PLACEHOLDER_OG_REGEX = /^lh-blog-placeholder-v(\d+)-og\.webp$/;

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function createWarning(code, message, files = undefined) {
  return files && files.length > 0 ? { code, severity: 'warn', message, files } : { code, severity: 'warn', message };
}

async function readWebpFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.webp'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function extractTemplateKey(file, regex) {
  const match = file.match(regex);
  return match ? match[1] : null;
}

async function main() {
  const warnings = [];

  const [heroFiles, ogFiles, placeholderFiles] = await Promise.all([
    readWebpFiles(HERO_DIR),
    readWebpFiles(OG_DIR),
    readWebpFiles(PLACEHOLDER_DIR),
  ]);

  const invalidHeroFiles = heroFiles.filter((file) => !HERO_REGEX.test(file));
  const invalidOgFiles = ogFiles.filter((file) => !OG_REGEX.test(file));

  if (invalidHeroFiles.length > 0) {
    warnings.push(createWarning('INVALID_HERO_FILENAME', 'Hero filenames must match lh-blog-<templateKey>-v1.webp.', invalidHeroFiles));
  }

  if (invalidOgFiles.length > 0) {
    warnings.push(createWarning('INVALID_OG_FILENAME', 'OG filenames must match lh-blog-<templateKey>-v1-og.webp.', invalidOgFiles));
  }

  const heroes = heroFiles
    .map((file) => {
      const templateKey = extractTemplateKey(file, HERO_REGEX);
      if (!templateKey) return null;
      return {
        templateKey,
        file,
        path: toPosix(path.relative(repoRoot, path.join(HERO_DIR, file))),
      };
    })
    .filter(Boolean);

  const og = ogFiles
    .map((file) => {
      const templateKey = extractTemplateKey(file, OG_REGEX);
      if (!templateKey) return null;
      return {
        templateKey,
        file,
        path: toPosix(path.relative(repoRoot, path.join(OG_DIR, file))),
      };
    })
    .filter(Boolean);

  const placeholders = placeholderFiles.map((file) => ({
    file,
    path: toPosix(path.relative(repoRoot, path.join(PLACEHOLDER_DIR, file))),
  }));

  const placeholderVariants = placeholderFiles
    .map((file) => {
      const match = file.match(PLACEHOLDER_REGEX);
      return match ? Number(match[1]) : null;
    })
    .filter((version) => version !== null)
    .sort((a, b) => a - b);

  const placeholderOgVariants = placeholderFiles
    .map((file) => {
      const match = file.match(PLACEHOLDER_OG_REGEX);
      return match ? Number(match[1]) : null;
    })
    .filter((version) => version !== null)
    .sort((a, b) => a - b);

  if (placeholderVariants.length === 0) {
    warnings.push(createWarning('MISSING_PLACEHOLDER_VARIANTS', 'No placeholder variants were found. Expected lh-blog-placeholder-v<1..n>.webp files.'));
  }

  const placeholderSet = new Set(placeholderVariants);
  const placeholderOgSet = new Set(placeholderOgVariants);

  const missingPlaceholderOgPairs = [...placeholderSet]
    .filter((version) => !placeholderOgSet.has(version))
    .map((version) => `lh-blog-placeholder-v${version}-og.webp`);

  const missingPlaceholderPairs = [...placeholderOgSet]
    .filter((version) => !placeholderSet.has(version))
    .map((version) => `lh-blog-placeholder-v${version}.webp`);

  if (missingPlaceholderOgPairs.length > 0) {
    warnings.push(createWarning('MISSING_PLACEHOLDER_OG_PAIR', 'Placeholder variants are missing matching -og files.', missingPlaceholderOgPairs));
  }

  if (missingPlaceholderPairs.length > 0) {
    warnings.push(createWarning('MISSING_PLACEHOLDER_PAIR', 'Placeholder -og variants are missing matching standard files.', missingPlaceholderPairs));
  }

  const heroKeySet = new Set(heroes.map((item) => item.templateKey));
  const ogKeySet = new Set(og.map((item) => item.templateKey));

  const missingOgKeys = [...heroKeySet].filter((key) => !ogKeySet.has(key)).sort((a, b) => a.localeCompare(b));
  const missingHeroKeys = [...ogKeySet].filter((key) => !heroKeySet.has(key)).sort((a, b) => a.localeCompare(b));

  if (missingOgKeys.length > 0) {
    warnings.push(createWarning('MISSING_OG_FOR_HERO', 'Hero templates exist without matching OG templates.', missingOgKeys));
  }

  if (missingHeroKeys.length > 0) {
    warnings.push(createWarning('MISSING_HERO_FOR_OG', 'OG templates exist without matching hero templates.', missingHeroKeys));
  }

  const summary = {
    heroCount: heroes.length,
    ogCount: og.length,
    placeholderCount: placeholders.length,
    placeholderVariantCount: placeholderVariants.length,
    placeholderOgVariantCount: placeholderOgVariants.length,
    warningCount: warnings.length,
  };

  const manifest = {
    generatedAt: new Date().toISOString(),
    heroes,
    og,
    placeholders,
    warnings,
    summary,
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log('Blog image manifest generated.');
  console.log(`Output: ${toPosix(path.relative(repoRoot, OUTPUT_PATH))}`);
  console.log(`Heroes: ${summary.heroCount}`);
  console.log(`OG: ${summary.ogCount}`);
  console.log(`Placeholders: ${summary.placeholderCount}`);
  console.log(`Placeholder variants: ${summary.placeholderVariantCount}`);
  console.log(`Placeholder OG variants: ${summary.placeholderOgVariantCount}`);
  console.log(`Warnings: ${summary.warningCount}`);

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`- [${warning.code}] ${warning.message}`);
      if (warning.files) {
        for (const file of warning.files) {
          console.log(`  - ${file}`);
        }
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
