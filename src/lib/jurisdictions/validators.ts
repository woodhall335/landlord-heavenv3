import { type DecisionRules, type FactsSchema, type JurisdictionKey, loadJurisdictionRuleBundle } from './rulesLoader';

export interface LegalValidationIssue {
  code: string;
  user_message: string;
  internal_reason?: string;
  fields?: string[];
  legal_basis?: string;
}

export interface LegalValidationResult {
  blocking: LegalValidationIssue[];
  warnings: LegalValidationIssue[];
}

export function resolveFactValue(facts: Record<string, any>, path: string): any {
  if (Object.prototype.hasOwnProperty.call(facts, path)) {
    return facts[path];
  }

  return path
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key) => {
      if (acc === undefined || acc === null) return undefined;
      return acc[key];
    }, facts);
}

// Backwards-compatible alias used across gating modules to avoid duplicate helper implementations
export const getFactValue = resolveFactValue;

function isMissing(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim().length === 0) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function extractVariables(expression: string): string[] {
  const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  const disallowed = new Set(['true', 'false', 'null', 'undefined', 'return']);
  const vars = new Set<string>();
  let match;

  while ((match = variableRegex.exec(expression)) !== null) {
    const variable = match[0];
    if (!disallowed.has(variable)) {
      vars.add(variable);
    }
  }

  return Array.from(vars);
}

function evaluateExpression(
  expression: string,
  facts: Record<string, any>
): { ok: boolean; reason?: string; evaluated: boolean } {
  const allowedChars = /^[0-9+\-*/().<>=!&| \t_a-zA-Z]+$/;
  if (!allowedChars.test(expression)) {
    return { ok: false, reason: 'Unsupported characters in rule expression', evaluated: false };
  }

  const variables = extractVariables(expression);
  const args: string[] = [];
  const values: any[] = [];

  for (const variable of variables) {
    const value = resolveFactValue(facts, variable);
    if (value === undefined) {
      return { ok: false, reason: `Missing fact for rule: ${variable}`, evaluated: false };
    }
    args.push(variable);
    values.push(value);
  }

  try {
    const evaluator = new Function(...args, `return (${expression});`);
    const result = evaluator(...values);
    return { ok: Boolean(result), evaluated: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message, evaluated: false };
  }
}

function buildGroundIndex(decisionRules: DecisionRules): Record<number, any> {
  const index: Record<number, any> = {};
  const mandatory = decisionRules.section_8_grounds?.mandatory || {};
  const discretionary = decisionRules.section_8_grounds?.discretionary || {};
  const buckets = [mandatory, discretionary];

  for (const bucket of buckets) {
    for (const [key, value] of Object.entries(bucket)) {
      const match = key.match(/ground_(\d+)/i);
      if (match) {
        const code = parseInt(match[1], 10);
        if (!Number.isNaN(code)) {
          index[code] = value;
        }
      }
    }
  }

  return index;
}

export function validateGroundsFromConfig(params: {
  jurisdiction: JurisdictionKey;
  decisionRules: DecisionRules;
  selectedGroundCodes: number[];
  facts: Record<string, any>;
}): LegalValidationResult {
  const { decisionRules, selectedGroundCodes, facts, jurisdiction } = params;
  const blocking: LegalValidationIssue[] = [];
  const warnings: LegalValidationIssue[] = [];

  const groundIndex = buildGroundIndex(decisionRules);
  const allowedGrounds = Object.keys(groundIndex).map((code) => Number(code));

  for (const code of selectedGroundCodes) {
    if (!allowedGrounds.includes(code)) {
      blocking.push({
        code: 'GROUND_NOT_ALLOWED',
        user_message: `Ground ${code} is not permitted for ${jurisdiction} notices`,
        internal_reason: 'Ground not present in jurisdiction decision_rules',
      });
    }
  }

  for (const code of selectedGroundCodes) {
    const cfg = groundIndex[code];
    if (!cfg) {
      continue;
    }

    const requiredFacts: string[] = cfg.required_facts || [];

    for (const factName of requiredFacts) {
      const value = resolveFactValue(facts, factName);
      if (isMissing(value)) {
        blocking.push({
          code: 'GROUND_REQUIRED_FACT_MISSING',
          user_message: `Ground ${code} is missing required fact: ${factName}`,
          fields: [factName],
          internal_reason: `Required by jurisdiction config for ground_${code}`,
        });
      }
    }

    const eligibilityRules: string[] = cfg.eligibility_rules || [];
    for (const rule of eligibilityRules) {
      const evaluation = evaluateExpression(rule, facts);
      if (!evaluation.ok) {
        blocking.push({
          code: 'GROUND_ELIGIBILITY_RULE_FAILED',
          user_message: `Ground ${code} eligibility not satisfied`,
          internal_reason: evaluation.reason || `Rule '${rule}' evaluated to false`,
          fields: cfg.required_facts || undefined,
        });
      }
    }
  }

  return { blocking, warnings };
}

interface SchemaFieldRequirement {
  path: string;
  required: boolean;
  required_if?: string;
}

function collectSchemaFields(schema: Record<string, any>, prefix = ''): SchemaFieldRequirement[] {
  const requirements: SchemaFieldRequirement[] = [];

  for (const [key, value] of Object.entries(schema)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && value.type) {
      requirements.push({
        path: currentPath,
        required: Boolean(value.required),
        required_if: value.required_if as string | undefined,
      });
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      requirements.push(...collectSchemaFields(value as Record<string, any>, currentPath));
    }
  }

  return requirements;
}

export function validateDepositCompliance(params: {
  jurisdiction: JurisdictionKey;
  factsSchema: FactsSchema;
  facts: Record<string, any>;
}): LegalValidationResult {
  const { factsSchema, facts, jurisdiction } = params;
  const blocking: LegalValidationIssue[] = [];
  const warnings: LegalValidationIssue[] = [];

  const depositTaken = resolveFactValue(facts, 'deposit_taken');

  if (depositTaken === undefined || depositTaken === null) {
    return { blocking, warnings };
  }

  // If the user explicitly confirmed no deposit was taken, skip deposit compliance checks
  // to avoid failing required_if expressions that only apply when a deposit exists.
  if (depositTaken === false) {
    return { blocking, warnings };
  }

  const schemaRoot = (factsSchema as any).common_facts ?? factsSchema;
  const relevantFields = collectSchemaFields(schemaRoot).filter((f) =>
    f.path.includes('deposit') || f.path.includes('prescribed_info')
  );

  for (const field of relevantFields) {
    const requiredFlag = field.required === true;
    const requiredIfEvaluation = field.required_if
      ? evaluateExpression(field.required_if, facts)
      : { ok: false, evaluated: false };
    const requiredIfFlag = field.required_if ? requiredIfEvaluation.ok && requiredIfEvaluation.evaluated : false;

    if (field.required_if && requiredIfEvaluation.evaluated === false) {
      blocking.push({
        code: 'REQUIRED_IF_EVALUATION_FAILED',
        user_message: `Cannot evaluate required_if for ${field.path}; missing or invalid facts`,
        fields: [field.path],
        internal_reason: requiredIfEvaluation.reason,
      });
    }

    const isRequired = requiredFlag || requiredIfFlag;
    if (!isRequired) continue;

    const value = resolveFactValue(facts, field.path);
    const fallbackValue = field.path.includes('.')
      ? resolveFactValue(facts, field.path.split('.').pop() as string)
      : undefined;
    const resolvedValue = value === undefined ? fallbackValue : value;

    if (isMissing(resolvedValue)) {
      blocking.push({
        code: 'DEPOSIT_FIELD_REQUIRED',
        user_message: `Deposit compliance missing: ${field.path}`,
        fields: [field.path],
        internal_reason: `Required by facts_schema for ${jurisdiction}`,
      });
    }
  }

  if (depositTaken === true) {
    const depositProtected = resolveFactValue(facts, 'deposit_protected');
    if (depositProtected === false || depositProtected === undefined) {
      blocking.push({
        code: 'DEPOSIT_NOT_PROTECTED',
        user_message: 'Deposit must be protected in an approved scheme before notice can be served',
        fields: ['deposit_protected'],
      });
    }

    const prescribed =
      resolveFactValue(facts, 'prescribed_info_given') ??
      resolveFactValue(facts, 'prescribed_info_provided') ??
      resolveFactValue(facts, 'prescribed_info_served');
    if (isMissing(prescribed)) {
      blocking.push({
        code: 'PRESCRIBED_INFO_MISSING',
        user_message: 'Prescribed information must be served when a deposit was taken',
        fields: ['prescribed_info_given', 'prescribed_info_provided', 'prescribed_info_served'],
      });
    }
  }

  return { blocking, warnings };
}

export function validateJurisdictionCompliance(params: {
  jurisdiction: JurisdictionKey;
  facts: Record<string, any>;
  selectedGroundCodes: number[];
}): LegalValidationResult {
  const { jurisdiction, facts, selectedGroundCodes } = params;
  let bundle: ReturnType<typeof loadJurisdictionRuleBundle> | null = null;
  try {
    bundle = loadJurisdictionRuleBundle(jurisdiction);
  } catch (err) {
    return {
      blocking: [
        {
          code: 'JURISDICTION_RULES_UNAVAILABLE',
          user_message: 'Unable to load jurisdiction rules',
          internal_reason: (err as Error).message,
        },
      ],
      warnings: [],
    };
  }
  const blocking: LegalValidationIssue[] = [];
  const warnings: LegalValidationIssue[] = [];

  if (!bundle.evictionSupported) {
    blocking.push({
      code: 'JURISDICTION_EVICTION_UNSUPPORTED',
      user_message: 'Eviction notices are not supported for this jurisdiction',
      internal_reason: 'decision_rules.jurisdiction.eviction_supported is false',
    });
  }

  if (bundle.factsSchemaMissing) {
    blocking.push({
      code: 'FACTS_SCHEMA_MISSING',
      user_message: 'Required facts schema is missing for this jurisdiction',
      internal_reason: 'facts_schema.json not present in jurisdiction config',
    });
  }

  const groundResult = validateGroundsFromConfig({
    jurisdiction,
    decisionRules: bundle.decisionRules,
    selectedGroundCodes,
    facts,
  });

  const depositResult = validateDepositCompliance({
    jurisdiction,
    factsSchema: bundle.factsSchema,
    facts,
  });

  return {
    blocking: [...blocking, ...groundResult.blocking, ...depositResult.blocking],
    warnings: [...warnings, ...groundResult.warnings, ...depositResult.warnings],
  };
}
