#!/usr/bin/env node
/**
 * Blog Image Manifest Generator
 *
 * Naming convention:
 * - Hero: lh-blog-<templateKey>-v1.webp
 * - OG: lh-blog-<templateKey>-v1-og.webp
 * - Placeholders:
 *   - lh-blog-placeholder-v1.webp
 *   - lh-blog-placeholder-v1-og.webp
 *   - lh-blog-icon-fallback-v1.webp
 *   - lh-blog-icon-fallback-v1-og.webp
 *
 * Usage:
 * - npm run blog:images
 * - node scripts/blog-image-manifest.mjs
 */

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

const HERO_REGEX = /^lh-blog-[a-z0-9-]+-v1\.webp$/;
const OG_REGEX = /^lh-blog-[a-z0-9-]+-v1-og\.webp$/;
const BAD_VERSION_FRAGMENT_REGEX = /-v1-\d+/;

const REQUIRED_PLACEHOLDERS = new Set([
  'lh-blog-placeholder-v1.webp',
  'lh-blog-placeholder-v1-og.webp',
  'lh-blog-icon-fallback-v1.webp',
  'lh-blog-icon-fallback-v1-og.webp',
]);

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function extractTemplateKey(file) {
  return file
    .replace(/^lh-blog-/, '')
    .replace(/-v1-og\.webp$/, '')
    .replace(/-v1\.webp$/, '');
}

function createWarning(code, severity, message, files = undefined) {
  return files && files.length > 0 ? { code, severity, message, files } : { code, severity, message };
}

async function readWebpFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.webp'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function main() {
  const warnings = [];

  const [heroFiles, ogFiles, placeholderFiles] = await Promise.all([
    readWebpFiles(HERO_DIR),
    readWebpFiles(OG_DIR),
    readWebpFiles(PLACEHOLDER_DIR),
  ]);

  const heroes = heroFiles.map((file) => ({
    templateKey: extractTemplateKey(file),
    file,
    path: toPosix(path.relative(repoRoot, path.join(HERO_DIR, file))),
  }));

  const og = ogFiles.map((file) => ({
    templateKey: extractTemplateKey(file),
    file,
    path: toPosix(path.relative(repoRoot, path.join(OG_DIR, file))),
  }));

  const placeholders = placeholderFiles.map((file) => ({
    file,
    path: toPosix(path.relative(repoRoot, path.join(PLACEHOLDER_DIR, file))),
  }));

  const invalidHeroFiles = heroFiles.filter((file) => !HERO_REGEX.test(file));
  if (invalidHeroFiles.length > 0) {
    warnings.push(
      createWarning(
        'INVALID_HERO_FILENAME',
        'warn',
        'One or more hero images do not match required pattern ^lh-blog-[a-z0-9-]+-v1\\.webp$.',
        invalidHeroFiles,
      ),
    );
  }

  const invalidOgFiles = ogFiles.filter((file) => !OG_REGEX.test(file));
  if (invalidOgFiles.length > 0) {
    warnings.push(
      createWarning(
        'INVALID_OG_FILENAME',
        'warn',
        'One or more OG images do not match required pattern ^lh-blog-[a-z0-9-]+-v1-og\\.webp$.',
        invalidOgFiles,
      ),
    );
  }

  const badVersionFragmentFiles = [...heroFiles, ...ogFiles, ...placeholderFiles].filter((file) =>
    BAD_VERSION_FRAGMENT_REGEX.test(file),
  );

  if (badVersionFragmentFiles.length > 0) {
    warnings.push(
      createWarning(
        'BAD_VERSION_FRAGMENT',
        'warn',
        'Found filenames containing unexpected version fragments (for example -v1-01).',
        [...new Set(badVersionFragmentFiles)].sort((a, b) => a.localeCompare(b)),
      ),
    );
  }

  const heroKeySet = new Set(heroes.map((item) => item.templateKey));
  const ogKeySet = new Set(og.map((item) => item.templateKey));

  const missingOgKeys = [...heroKeySet].filter((key) => !ogKeySet.has(key)).sort((a, b) => a.localeCompare(b));
  if (missingOgKeys.length > 0) {
    warnings.push(
      createWarning(
        'MISSING_OG_FOR_HERO',
        'warn',
        'Hero images exist without matching OG images for the same templateKey.',
        missingOgKeys,
      ),
    );
  }

  const missingHeroKeys = [...ogKeySet].filter((key) => !heroKeySet.has(key)).sort((a, b) => a.localeCompare(b));
  if (missingHeroKeys.length > 0) {
    warnings.push(
      createWarning(
        'MISSING_HERO_FOR_OG',
        'warn',
        'OG images exist without matching hero images for the same templateKey.',
        missingHeroKeys,
      ),
    );
  }

  const missingRequiredPlaceholders = [...REQUIRED_PLACEHOLDERS]
    .filter((file) => !placeholderFiles.includes(file))
    .sort((a, b) => a.localeCompare(b));

  if (missingRequiredPlaceholders.length > 0) {
    warnings.push(
      createWarning(
        'MISSING_PLACEHOLDER',
        'warn',
        'One or more required placeholder assets are missing.',
        missingRequiredPlaceholders,
      ),
    );
  }

  const summary = {
    heroCount: heroes.length,
    ogCount: og.length,
    placeholderCount: placeholders.length,
    warningCount: warnings.length,
    missingPairs: missingOgKeys.length + missingHeroKeys.length,
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
  console.log(`Warnings: ${summary.warningCount}`);
  console.log(`Missing pairs: ${summary.missingPairs}`);

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`- [${warning.severity}] ${warning.code}: ${warning.message}`);
      if (warning.files) {
        console.log(`  ${warning.files.join(', ')}`);
      }
    }
  }
}

main().catch((error) => {
  console.error('Failed to generate blog image manifest.');
  console.error(error);
  process.exitCode = 0;
});
