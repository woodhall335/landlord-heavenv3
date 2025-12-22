import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { CaseFacts, WizardFacts } from '@/lib/case-facts/schema';
import type { ExtendedWizardQuestion } from './types';
import { normalizeQuestions } from './normalize';
import { setFactPath } from '@/lib/case-facts/mapping';

export type ProductType = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

export interface MasterQuestionSet {
  id: string; // e.g. "notice_only_england"
  product: ProductType;
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  version: string; // e.g. "1.0.0"
  questions: ExtendedWizardQuestion[];
}

// Utility to load YAML MQS by product + jurisdiction
export function loadMQS(product: ProductType, jurisdiction: string): MasterQuestionSet | null {
  const basePath = path.join(process.cwd(), 'config', 'mqs', product, `${jurisdiction}.yaml`);

  if (!fs.existsSync(basePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(basePath, 'utf8');
  const parsed = yaml.load(fileContents) as MasterQuestionSet;

  return {
    ...parsed,
    questions: normalizeQuestions(parsed.questions || [], jurisdiction),
  } as MasterQuestionSet;
}

function getValueAtPath(facts: Record<string, any>, path: string): unknown {
  if (Object.prototype.hasOwnProperty.call(facts, path)) {
    return (facts as Record<string, any>)[path];
  }
  return path
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key) => {
      if (acc === undefined || acc === null) return undefined;
      const resolvedKey = Number.isInteger(Number(key)) ? Number(key) : key;
      return acc[resolvedKey as keyof typeof acc];
    }, facts);
}

function isTruthyValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return true; // false is a deliberate answer (mapped-module-audit)
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
}

function deriveRoutesFromFacts(
  facts: WizardFacts | Record<string, any>,
  jurisdiction: MasterQuestionSet['jurisdiction']
): string[] {
  const answers = facts || {};
  const routes: string[] = [];

  // IMPORTANT: Check all possible route field names
  // Priority: selected_notice_route (auto-selected) > eviction_route > notice_type (legacy)
  const routeAnswer =
    (answers as any).selected_notice_route ||
    (answers as any).eviction_route ||
    (answers as any).notice_type;

  const docRoutes: string[] = (answers as any).__document_routes || [];

  if (jurisdiction === 'scotland') {
    routes.push('notice_to_leave');
  }

  if (Array.isArray(routeAnswer)) {
    routeAnswer.forEach((val) => {
      const lower = String(val).toLowerCase();
      // Handle both canonical values (section_8) and human-readable labels (Section 8)
      if (lower.includes('section_8') || lower.includes('section 8')) routes.push('section_8');
      if (lower.includes('section_21') || lower.includes('section 21')) routes.push('section_21');
      if (lower.includes('notice to leave')) routes.push('notice_to_leave');
    });
  } else if (routeAnswer) {
    const lower = String(routeAnswer).toLowerCase();
    // Handle both canonical values (section_8) and human-readable labels (Section 8)
    if (lower.includes('section_8') || lower.includes('section 8')) routes.push('section_8');
    if (lower.includes('section_21') || lower.includes('section 21')) routes.push('section_21');
    if (lower.includes('leave')) routes.push('notice_to_leave');
    if (lower.includes('quit')) routes.push('notice_to_quit');
  }

  docRoutes.forEach((r) => {
    if (!routes.includes(r)) routes.push(r);
  });

  return routes.length ? routes : ['unknown'];
}

function shouldSkipForProduct(question: ExtendedWizardQuestion, product: ProductType): boolean {
  if (product === 'notice_only') {
    const skipKeywords = ['claim', 'court', 'n5', 'n119', 'hearing'];
    return skipKeywords.some(
      (kw) =>
        question.id.toLowerCase().includes(kw) || question.question.toLowerCase().includes(kw)
    );
  }

  return false;
}

/**
 * Helper function to evaluate a single dependency condition
 */
function evaluateSingleDependency(
  condition: any,
  mqs: MasterQuestionSet,
  facts: Record<string, any>
): boolean {
  if (!condition || !condition.questionId) return true;

  // Find the dependency question to get its mapped path
  const dependency = mqs.questions.find((dep) => dep.id === condition.questionId);
  let depValue: any;

  // Try to get value from mapped paths first
  if (dependency?.maps_to?.length) {
    depValue = dependency.maps_to
      .map((path) => getValueAtPath(facts, path))
      .find((v) => v !== undefined);
  }

  // Fallback to direct fact key
  if (depValue === undefined) {
    depValue = facts[condition.questionId];
  }

  // Handle different condition types
  if (condition.valueContains !== undefined) {
    // valueContains: check if depValue is IN the array
    const allowedValues = Array.isArray(condition.valueContains)
      ? condition.valueContains
      : [condition.valueContains];

    return allowedValues.includes(depValue);
  }

  if (condition.value !== undefined) {
    // Standard value check
    if (Array.isArray(condition.value)) {
      // condition.value is array: check if depValue matches any
      if (Array.isArray(depValue)) {
        return depValue.some((val) => condition.value.includes(val));
      } else {
        return condition.value.includes(depValue);
      }
    } else {
      // condition.value is scalar
      if (Array.isArray(depValue)) {
        return depValue.includes(condition.value);
      } else {
        return depValue === condition.value;
      }
    }
  }

  return true;
}

function questionIsApplicable(
  mqs: MasterQuestionSet,
  question: ExtendedWizardQuestion,
  facts: CaseFacts | Record<string, any>
): boolean {
  const dependsOn = (question as any).depends_on || question.dependsOn;

  // Handle allOf (all conditions must be true)
  if (dependsOn?.allOf && Array.isArray(dependsOn.allOf)) {
    const allMatch = dependsOn.allOf.every((condition: any) =>
      evaluateSingleDependency(condition, mqs, facts as Record<string, any>)
    );
    if (!allMatch) return false;
  }

  // Handle anyOf (at least one condition must be true)
  else if (dependsOn?.anyOf && Array.isArray(dependsOn.anyOf)) {
    const anyMatch = dependsOn.anyOf.some((condition: any) =>
      evaluateSingleDependency(condition, mqs, facts as Record<string, any>)
    );
    if (!anyMatch) return false;
  }

  // Handle simple single condition (legacy format)
  else if (dependsOn?.questionId) {
    const matches = evaluateSingleDependency(dependsOn, mqs, facts as Record<string, any>);
    if (!matches) return false;
  }

  if (shouldSkipForProduct(question, mqs.product)) return false;

  const routes = deriveRoutesFromFacts(facts, mqs.jurisdiction);
  if (question.routes && question.routes.length) {
    const hasRoute = question.routes.some((r) => routes.includes(r));
    if (!hasRoute) return false;
  }

  if (mqs.jurisdiction === 'scotland') {
    if (question.id.toLowerCase().includes('section_8') || question.id.toLowerCase().includes('section_21')) {
      return false;
    }
  }

  if (question.skip_if_evidence?.length) {
    const evidence = (facts as any).evidence || {};
    const shouldSkip = question.skip_if_evidence.some((flag) => evidence[flag]);
    if (shouldSkip) return false;
  }

  return true;
}

export function normalizeAskOnceFacts(facts: WizardFacts, mqs: MasterQuestionSet): WizardFacts {
  let updatedFacts = { ...facts };

  mqs.questions.forEach((q) => {
    if (!q.maps_to || !q.maps_to.length) return;
    const allPresent = q.maps_to.every((path) => isTruthyValue(getValueAtPath(updatedFacts, path)));
    if (!allPresent && (updatedFacts as any)[q.id] !== undefined) {
      updatedFacts = setFactPath(updatedFacts, q.maps_to[0], (updatedFacts as any)[q.id]);
    }
  });

  return updatedFacts;
}

/**
 * Determines if a question is answered.
 *
 * For GROUP questions: Only required fields must be answered.
 * For other questions: All maps_to paths must be answered.
 *
 * This prevents optional fields from blocking wizard progression.
 */
function isQuestionAnsweredForMQS(
  question: ExtendedWizardQuestion,
  facts: Record<string, any>
): boolean {
  const maps = question.maps_to;

  if (maps && maps.length > 0) {
    // For GROUP questions with fields, only check REQUIRED fields
    if (question.inputType === 'group' && question.fields && question.fields.length > 0) {
      // Get required field IDs
      const requiredFieldIds = new Set(
        question.fields
          .filter((field) => field.validation?.required === true)
          .map((field) => field.id)
      );

      // If no required fields, question is considered answered
      if (requiredFieldIds.size === 0) {
        return true;
      }

      // Only check maps_to paths that correspond to required fields
      const requiredPaths = maps.filter((path) => {
        const lastSegment = path.split('.').pop();
        return lastSegment && requiredFieldIds.has(lastSegment);
      });

      // All required paths must be answered
      return requiredPaths.every((path) => isTruthyValue(getValueAtPath(facts, path)));
    }

    // For non-group questions, all maps_to paths must be answered
    return maps.every((path) => isTruthyValue(getValueAtPath(facts, path)));
  }

  // For questions without maps_to, check if answered directly by question ID
  const fallbackValue = facts[question.id];
  return isTruthyValue(fallbackValue);
}

// Determine the next question from an MQS definition and current facts
export function getNextMQSQuestion(
  mqs: MasterQuestionSet,
  collectedFacts: CaseFacts | Record<string, any>
): ExtendedWizardQuestion | null {
  const answered = collectedFacts || {};

  for (const q of mqs.questions) {
    if (!questionIsApplicable(mqs, q, answered)) continue;

    // Use the group-aware isQuestionAnswered logic
    if (!isQuestionAnsweredForMQS(q, answered as Record<string, any>)) {
      return q;
    }
  }

  return null; // no more questions
}

export { questionIsApplicable, deriveRoutesFromFacts, isQuestionAnsweredForMQS };
