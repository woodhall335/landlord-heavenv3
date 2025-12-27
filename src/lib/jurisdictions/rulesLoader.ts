import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { CanonicalJurisdiction } from '../types/jurisdiction';

export type JurisdictionKey = CanonicalJurisdiction;

export interface DecisionRules {
  jurisdiction?: {
    name?: string;
    tenancy_type?: string;
    eviction_supported?: boolean;
  };
  section_8_grounds?: {
    mandatory?: Record<string, any>;
    discretionary?: Record<string, any>;
  };
  [key: string]: any;
}

export interface FactsSchema {
  [key: string]: any;
}

export interface JurisdictionRuleBundle {
  decisionRules: DecisionRules;
  factsSchema: FactsSchema;
  allowedGroundCodes: number[];
  evictionSupported: boolean;
  factsSchemaMissing?: boolean;
}

const JURISDICTION_PATHS: Record<JurisdictionKey, string> = {
  england: 'england',
  wales: 'wales',
  scotland: 'scotland',
  'northern-ireland': 'northern-ireland',
};

function getJurisdictionDir(jurisdiction: JurisdictionKey): string {
  const dir = JURISDICTION_PATHS[jurisdiction];
  if (!dir) {
    throw new Error(`Unsupported jurisdiction: ${jurisdiction}`);
  }

  return path.join(process.cwd(), 'config', 'jurisdictions', 'uk', dir);
}

function parseGroundCode(key: string): number | null {
  const match = key.match(/ground_(\d+)/i);
  if (!match) return null;
  const code = parseInt(match[1], 10);
  return Number.isNaN(code) ? null : code;
}

export function loadDecisionRules(jurisdiction: JurisdictionKey): DecisionRules {
  const dir = getJurisdictionDir(jurisdiction);
  const rulesPath = path.join(dir, 'decision_rules.yaml');

  if (!fs.existsSync(rulesPath)) {
    throw new Error(`decision_rules.yaml not found for jurisdiction ${jurisdiction}`);
  }

  const file = fs.readFileSync(rulesPath, 'utf8');
  return (yaml.load(file) as DecisionRules) ?? {};
}

export function loadFactsSchema(jurisdiction: JurisdictionKey): { schema: FactsSchema; missing: boolean } {
  const dir = getJurisdictionDir(jurisdiction);
  const schemaPath = path.join(dir, 'facts_schema.json');

  if (!fs.existsSync(schemaPath)) {
    return { schema: {}, missing: true };
  }

  const file = fs.readFileSync(schemaPath, 'utf8');
  return { schema: JSON.parse(file) as FactsSchema, missing: false };
}

export function loadJurisdictionRuleBundle(jurisdiction: JurisdictionKey): JurisdictionRuleBundle {
  const decisionRules = loadDecisionRules(jurisdiction);
  const factsSchemaResult = loadFactsSchema(jurisdiction);

  const allowedGroundCodes: number[] = [];
  const mandatory = decisionRules.section_8_grounds?.mandatory || {};
  const discretionary = decisionRules.section_8_grounds?.discretionary || {};

  for (const key of [...Object.keys(mandatory), ...Object.keys(discretionary)]) {
    const parsed = parseGroundCode(key);
    if (parsed !== null) {
      allowedGroundCodes.push(parsed);
    }
  }

  const evictionSupported = decisionRules.jurisdiction?.eviction_supported !== false;

  return {
    decisionRules,
    factsSchema: factsSchemaResult.schema,
    allowedGroundCodes,
    evictionSupported,
    factsSchemaMissing: factsSchemaResult.missing,
  };
}

export function safeLoadJurisdictionBundle(jurisdiction: JurisdictionKey): JurisdictionRuleBundle | null {
  try {
    return loadJurisdictionRuleBundle(jurisdiction);
  } catch (err) {
    console.error('[JURISDICTION RULE LOADER] Failed to load rules', jurisdiction, err);
    return null;
  }
}
