import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Module from 'module';
import type { AskHeavenQuestion } from '../src/lib/ask-heaven/questions/types';

const ARTIFACT_DIR = path.resolve('artifacts');
const CSV_PATH = path.join(ARTIFACT_DIR, 'ask-heaven-indexability-audit.csv');
const JSON_PATH = path.join(ARTIFACT_DIR, 'ask-heaven-indexability-audit.json');
const SEED_SQL_PATH = path.resolve('supabase/migrations/016_ask_heaven_questions.sql');

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type SeedRow = {
  slug: string;
  question: string;
  summary: string;
  primary_topic: string;
  jurisdictions: string[];
  related_slugs: string[];
  template_key: string;
};

type AskHeavenModules = {
  getQuestionRepository: () => any;
  InMemoryQuestionRepository: new () => any;
  validateQualityGates: (question: AskHeavenQuestion) => {
    passed: boolean;
    forceNoindex: boolean;
    failures: { gate: string; reason: string; severity: 'error' | 'warning' }[];
    warnings: string[];
    wordCount: number;
  };
  getMetaRobots: (question: AskHeavenQuestion) => string;
  getIndexabilityStatus: (question: AskHeavenQuestion) => {
    status: 'indexable' | 'noindex' | 'blocked';
    label: string;
    details: string[];
  };
};

async function loadAskHeavenModules(): Promise<AskHeavenModules> {
  const originalResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
    if (request === 'server-only') {
      return path.join(process.cwd(), 'scripts', 'empty-module.js');
    }
    if (typeof request === 'string' && request.startsWith('@/')) {
      const mapped = path.join(process.cwd(), 'src', request.slice(2));
      return originalResolveFilename.call(this, mapped, parent, isMain, options);
    }
    return originalResolveFilename.call(this, request, parent, isMain, options);
  };

  const questionsModule = await import('../src/lib/ask-heaven/questions');
  return questionsModule as AskHeavenModules;
}

function addUtm(url: string, slug: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=ask_heaven&utm_medium=seo&utm_campaign=pilot&utm_content=${slug}`;
}

function extractTemplate(sql: string, functionName: string): string {
  const regex = new RegExp(
    `ask_heaven_template_${functionName}[\\s\\S]*?\\$template\\$([\\s\\S]*?)\\$template\\$`,
    'm'
  );
  const match = sql.match(regex);
  if (!match) {
    throw new Error(`Template not found for ${functionName}`);
  }
  return match[1].trim();
}

function formatTemplate(template: string, args: string[]): string {
  let index = 0;
  return template.replace(/%s/g, () => {
    const value = args[index];
    index += 1;
    return value ?? '';
  });
}

function parseSeedRows(sql: string): SeedRow[] {
  const seedMatch = sql.match(/WITH seed AS \(\s*SELECT \* FROM \(VALUES([\s\S]*?)\) AS v/s);
  if (!seedMatch) {
    throw new Error('Seed data block not found in SQL migration');
  }

  const seedBlock = seedMatch[1];
  const tuples: string[] = [];
  let inString = false;
  let depth = 0;
  let start = -1;

  for (let i = 0; i < seedBlock.length; i += 1) {
    const char = seedBlock[i];
    const next = seedBlock[i + 1];

    if (char === "'" && next === "'") {
      i += 1;
      continue;
    }

    if (char === "'") {
      inString = !inString;
    }

    if (!inString) {
      if (char === '(') {
        if (depth === 0) {
          start = i + 1;
        }
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
        if (depth === 0 && start !== -1) {
          tuples.push(seedBlock.slice(start, i));
          start = -1;
        }
      }
    }
  }

  const rows: SeedRow[] = [];

  const splitFields = (tuple: string): string[] => {
    const fields: string[] = [];
    let buffer = '';
    let inFieldString = false;
    let bracketDepth = 0;

    for (let i = 0; i < tuple.length; i += 1) {
      const char = tuple[i];
      const next = tuple[i + 1];

      if (char === "'" && next === "'") {
        buffer += "''";
        i += 1;
        continue;
      }

      if (char === "'") {
        inFieldString = !inFieldString;
        buffer += char;
        continue;
      }

      if (!inFieldString) {
        if (char === '[') {
          bracketDepth += 1;
        } else if (char === ']') {
          bracketDepth -= 1;
        }

        if (char === ',' && bracketDepth === 0) {
          fields.push(buffer.trim());
          buffer = '';
          continue;
        }
      }

      buffer += char;
    }

    if (buffer.trim()) {
      fields.push(buffer.trim());
    }

    return fields;
  };

  for (const tuple of tuples) {
    const fields = splitFields(tuple);
    if (fields.length !== 7) {
      throw new Error(`Unexpected seed tuple format: ${tuple}`);
    }

    const parseString = (value: string): string => {
      const trimmed = value.trim();
      if (!trimmed.startsWith("'")) {
        throw new Error(`Expected string literal, got: ${value}`);
      }
      const inner = trimmed.slice(1, -1);
      return inner.replace(/''/g, "'");
    };

    const parseArray = (value: string): string[] => {
      const trimmed = value.trim();
      if (!trimmed.startsWith('ARRAY[')) {
        throw new Error(`Expected ARRAY literal, got: ${value}`);
      }
      const inner = trimmed.slice(6, -1);
      const matches = Array.from(inner.matchAll(/'((?:''|[^'])*)'/g));
      return matches.map((match) => match[1].replace(/''/g, "'"));
    };

    rows.push({
      slug: parseString(fields[0]),
      question: parseString(fields[1]),
      summary: parseString(fields[2]),
      primary_topic: parseString(fields[3]),
      jurisdictions: parseArray(fields[4]),
      related_slugs: parseArray(fields[5]),
      template_key: parseString(fields[6]),
    });
  }

  return rows;
}

function buildAnswerTemplates(sql: string) {
  const templateEnglandEviction = extractTemplate(sql, 'england_eviction');
  const templateEnglandArrears = extractTemplate(sql, 'england_arrears');
  const templateTenancy = extractTemplate(sql, 'tenancy');
  const templateWales = extractTemplate(sql, 'wales');
  const templateScotland = extractTemplate(sql, 'scotland');

  return {
    england_eviction: (question: string, slug: string) => {
      const s21Url = addUtm(
        'https://landlordheaven.co.uk/tools/free-section-21-notice-generator',
        slug
      );
      const s8Url = addUtm(
        'https://landlordheaven.co.uk/tools/free-section-8-notice-generator',
        slug
      );
      const validatorUrl = addUtm('https://landlordheaven.co.uk/tools/validators', slug);
      const packUrl = addUtm('https://landlordheaven.co.uk/products/complete-pack', slug);
      const wizardUrl = addUtm(
        'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction',
        slug
      );
      const tenancyUrl = addUtm('https://landlordheaven.co.uk/products/ast', slug);

      const args = [
        question,
        s21Url,
        s8Url,
        validatorUrl,
        packUrl,
        wizardUrl,
        wizardUrl,
        validatorUrl,
        wizardUrl,
        s21Url,
        s8Url,
        validatorUrl,
        packUrl,
        tenancyUrl,
      ];

      return formatTemplate(templateEnglandEviction, args);
    },
    england_arrears: (question: string, slug: string) => {
      const arrearsCalcUrl = addUtm(
        'https://landlordheaven.co.uk/tools/rent-arrears-calculator',
        slug
      );
      const demandLetterUrl = addUtm(
        'https://landlordheaven.co.uk/tools/free-rent-demand-letter',
        slug
      );
      const moneyClaimUrl = addUtm('https://landlordheaven.co.uk/products/money-claim', slug);
      const s8Url = addUtm(
        'https://landlordheaven.co.uk/tools/free-section-8-notice-generator',
        slug
      );
      const wizardUrl = addUtm(
        'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction',
        slug
      );

      const args = [
        question,
        arrearsCalcUrl,
        demandLetterUrl,
        s8Url,
        moneyClaimUrl,
        wizardUrl,
        arrearsCalcUrl,
        demandLetterUrl,
        s8Url,
        moneyClaimUrl,
        wizardUrl,
        arrearsCalcUrl,
        demandLetterUrl,
        s8Url,
        moneyClaimUrl,
      ];

      return formatTemplate(templateEnglandArrears, args);
    },
    tenancy: (question: string, slug: string) => {
      const tenancyUrl = addUtm('https://landlordheaven.co.uk/products/ast', slug);
      const validatorUrl = addUtm('https://landlordheaven.co.uk/tools/validators', slug);

      const args = [question, tenancyUrl, validatorUrl, tenancyUrl, validatorUrl];
      return formatTemplate(templateTenancy, args);
    },
    wales: (question: string, slug: string) => {
      const wizardUrl = addUtm(
        'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction',
        slug
      );
      const tenancyUrl = addUtm('https://landlordheaven.co.uk/products/ast', slug);
      const arrearsCalcUrl = addUtm(
        'https://landlordheaven.co.uk/tools/rent-arrears-calculator',
        slug
      );

      const args = [
        question,
        wizardUrl,
        tenancyUrl,
        arrearsCalcUrl,
        wizardUrl,
        wizardUrl,
        tenancyUrl,
        arrearsCalcUrl,
      ];

      return formatTemplate(templateWales, args);
    },
    scotland: (question: string, slug: string) => {
      const wizardUrl = addUtm(
        'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction',
        slug
      );
      const tenancyUrl = addUtm('https://landlordheaven.co.uk/products/ast', slug);
      const arrearsCalcUrl = addUtm(
        'https://landlordheaven.co.uk/tools/rent-arrears-calculator',
        slug
      );

      const args = [
        question,
        wizardUrl,
        tenancyUrl,
        arrearsCalcUrl,
        wizardUrl,
        tenancyUrl,
        arrearsCalcUrl,
      ];

      return formatTemplate(templateScotland, args);
    },
  };
}

async function loadQuestionsFromRepository(
  modules: AskHeavenModules
): Promise<AskHeavenQuestion[]> {
  const repository = modules.getQuestionRepository();
  const allQuestions: AskHeavenQuestion[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const batch = await repository.list({ limit, offset });
    if (batch.length === 0) {
      break;
    }

    for (const item of batch) {
      const question = await repository.getBySlug(item.slug);
      if (question) {
        allQuestions.push(question);
      }
    }

    if (batch.length < limit) {
      break;
    }

    offset += limit;
  }

  return allQuestions;
}

function buildQuestionsFromSeed(): AskHeavenQuestion[] {
  const sql = fs.readFileSync(SEED_SQL_PATH, 'utf8');
  const seedRows = parseSeedRows(sql);
  const templates = buildAnswerTemplates(sql);
  const now = new Date().toISOString();

  return seedRows.map((row) => {
    const templateFn = templates[row.template_key as keyof typeof templates];
    if (!templateFn) {
      throw new Error(`Unknown template key: ${row.template_key}`);
    }

    return {
      id: crypto.randomUUID(),
      slug: row.slug,
      question: row.question,
      summary: row.summary,
      answer_md: templateFn(row.question, row.slug),
      primary_topic: row.primary_topic as AskHeavenQuestion['primary_topic'],
      jurisdictions: row.jurisdictions as AskHeavenQuestion['jurisdictions'],
      status: 'review',
      canonical_slug: null,
      related_slugs: row.related_slugs,
      created_at: now,
      updated_at: now,
      reviewed_at: null,
    };
  });
}

function ensureArtifactsDir() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }
}

function toCsvValue(value: unknown): string {
  const stringValue = value === null || value === undefined ? '' : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function main() {
  ensureArtifactsDir();

  const modules = await loadAskHeavenModules();
  let questions = await loadQuestionsFromRepository(modules);
  let dataSource = 'repository';

  if (questions.length === 0) {
    const repository = modules.getQuestionRepository();
    if (repository instanceof modules.InMemoryQuestionRepository) {
      dataSource = 'sql-seed';
      questions = buildQuestionsFromSeed();
    }
  }

  const rows = questions.map((question) => {
    const qualityResult = modules.validateQualityGates(question);
    const robots = modules.getMetaRobots(question);
    const indexability = modules.getIndexabilityStatus(question);
    const sitemapIncluded =
      question.status === 'approved' &&
      question.canonical_slug === null &&
      SLUG_REGEX.test(question.slug);

    const primaryBlockReasons: string[] = [];
    if (question.status !== 'approved') {
      primaryBlockReasons.push(`status: ${question.status}`);
    } else if (question.canonical_slug) {
      primaryBlockReasons.push(`canonical_slug: ${question.canonical_slug}`);
    } else if (!qualityResult.passed) {
      primaryBlockReasons.push(
        ...qualityResult.failures
          .filter((failure) => failure.severity === 'error')
          .map((failure) => `${failure.gate}: ${failure.reason}`)
      );
    }

    return {
      slug: question.slug,
      status: question.status,
      canonical_slug: question.canonical_slug,
      jurisdictions: question.jurisdictions,
      summaryLength: question.summary?.length ?? 0,
      wordCount: qualityResult.wordCount,
      failures: qualityResult.failures.map((failure) => ({
        gate: failure.gate,
        reason: failure.reason,
        severity: failure.severity,
      })),
      robots,
      sitemapIncluded,
      indexabilityStatus: indexability.status,
      indexabilityLabel: indexability.label,
      indexabilityDetails: indexability.details,
      primaryBlockReasons,
      dataSource,
    };
  });

  fs.writeFileSync(JSON_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

  const headers = [
    'slug',
    'status',
    'canonical_slug',
    'jurisdictions',
    'summaryLength',
    'wordCount',
    'failures',
    'robots',
    'sitemapIncluded',
    'indexabilityStatus',
    'indexabilityLabel',
    'indexabilityDetails',
    'primaryBlockReasons',
    'dataSource',
  ];

  const csvLines = [headers.map(toCsvValue).join(',')];
  for (const row of rows) {
    csvLines.push(
      [
        row.slug,
        row.status,
        row.canonical_slug ?? '',
        row.jurisdictions.join('|'),
        row.summaryLength,
        row.wordCount,
        row.failures.map((failure) => `${failure.gate}: ${failure.reason}`).join(' | '),
        row.robots,
        row.sitemapIncluded,
        row.indexabilityStatus,
        row.indexabilityLabel,
        row.indexabilityDetails.join(' | '),
        row.primaryBlockReasons.join(' | '),
        row.dataSource,
      ]
        .map(toCsvValue)
        .join(',')
    );
  }

  fs.writeFileSync(CSV_PATH, `${csvLines.join('\n')}\n`, 'utf8');

  console.log(`Ask Heaven audit rows: ${rows.length}`);
  console.log(`Data source: ${dataSource}`);
  console.log(`CSV: ${CSV_PATH}`);
  console.log(`JSON: ${JSON_PATH}`);
}

main().catch((error) => {
  console.error('Ask Heaven audit failed:', error);
  process.exitCode = 1;
});
