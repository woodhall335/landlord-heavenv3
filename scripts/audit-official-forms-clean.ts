#!/usr/bin/env ts-node --transpile-only

import fs from 'fs';
import path from 'path';

const OFFICIAL_FORMS_DIR = path.join(process.cwd(), 'public', 'official-forms');

const BLOCKERS: { regex: RegExp; reason: string }[] = [
  { regex: /_(\d{10,})\.pdf$/i, reason: 'timestamped suffix (_##########.pdf) not allowed' },
  { regex: /-(\d{10,})\.pdf$/i, reason: 'timestamped suffix (-##########.pdf) not allowed' },
  { regex: /(\d{10,})\.pdf$/i, reason: 'timestamped filename (##########.pdf) not allowed' },
  { regex: /preview/i, reason: 'preview artifacts are not allowed in canonical directory' },
  { regex: /generated/i, reason: 'generated artifacts are not allowed in canonical directory' },
];

interface Violation {
  file: string;
  reason: string;
}

function collectFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function findViolations(root: string): Violation[] {
  const violations: Violation[] = [];
  const files = collectFiles(root);

  for (const file of files) {
    const normalized = file.replace(root, '');
    const basename = path.basename(file);

    if (!basename.toLowerCase().endsWith('.pdf')) continue;

    for (const blocker of BLOCKERS) {
      if (blocker.regex.test(basename)) {
        violations.push({ file: normalized || basename, reason: blocker.reason });
        break;
      }
    }
  }

  return violations;
}

function main() {
  if (!fs.existsSync(OFFICIAL_FORMS_DIR)) {
    console.error(`Official forms directory missing: ${OFFICIAL_FORMS_DIR}`);
    process.exit(1);
  }

  const violations = findViolations(OFFICIAL_FORMS_DIR);

  if (violations.length > 0) {
    console.error(
      'Found generated/timestamped PDF in canonical official forms dir. Remove it and re-run. This directory must contain only stable official PDFs.',
    );
    console.error('Offending files:');
    for (const violation of violations) {
      console.error(`- ${violation.file} (${violation.reason})`);
    }
    process.exit(1);
  }

  console.log('✅ official forms directory is clean (no timestamped/generated PDFs detected).');
}

main();
