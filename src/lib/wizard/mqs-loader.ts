import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { CaseFacts } from '@/lib/case-facts/schema';
import type { ExtendedWizardQuestion } from './types';
import { normalizeQuestions } from './normalize';

export type ProductType = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

export interface MasterQuestionSet {
  id: string; // e.g. "notice_only_england_wales"
  product: ProductType;
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
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

// Determine the next question from an MQS definition and current facts
export function getNextMQSQuestion(
  mqs: MasterQuestionSet,
  collectedFacts: CaseFacts | Record<string, any>
): ExtendedWizardQuestion | null {
  const answered = collectedFacts || {};

  const findDependentValue = (questionId: string) => {
    const dependency = mqs.questions.find((q) => q.id === questionId);
    if (dependency?.maps_to?.length) {
      const mappedValue = dependency.maps_to
        .map((path) => getValueAtPath(answered as Record<string, any>, path))
        .find((v) => v !== undefined);
      if (mappedValue !== undefined) return mappedValue;
    }
    return (answered as Record<string, any>)[questionId];
  };

  for (const q of mqs.questions) {
    const dependsOn = (q as any).depends_on || q.dependsOn;
    if (dependsOn?.questionId) {
      const depValue = findDependentValue(dependsOn.questionId);
      if (Array.isArray(dependsOn.value)) {
        // Handle when user's answer is also an array (multi_select questions)
        if (Array.isArray(depValue)) {
          // Check if arrays intersect (any value in depValue is in dependsOn.value)
          const hasMatch = depValue.some(val => dependsOn.value.includes(val));
          if (!hasMatch) continue;
        } else {
          // User's answer is scalar, check if it's in the dependency array
          if (!dependsOn.value.includes(depValue)) continue;
        }
      } else if (depValue !== dependsOn.value) {
        continue;
      }
    }

    const maps = q.maps_to;
    if (maps && maps.length > 0) {
      const allMapped = maps.every((path) => isTruthyValue(getValueAtPath(answered as Record<string, any>, path)));
      if (!allMapped) {
        return q;
      }
      continue;
    }

    // For questions without maps_to, check if answered directly by question ID
    const fallbackValue = (answered as Record<string, any>)[q.id];
    if (!isTruthyValue(fallbackValue)) {
      return q;
    }
  }

  return null; // no more questions
}
