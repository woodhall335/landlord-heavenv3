import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { ExtendedWizardQuestion } from './types';

export type ProductType = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

interface MasterQuestionSet {
  id: string; // e.g. "notice_only_england_wales"
  product: ProductType;
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
  version: string; // e.g. "1.0.0"
  questions: ExtendedWizardQuestion[];
}

// Utility to load YAML MQS by product + jurisdiction
export function loadMQS(product: ProductType, jurisdiction: string): MasterQuestionSet | null {
  // For now we only support E&W eviction MQS via YAML
  if (jurisdiction !== 'england-wales') return null;
  if (product !== 'notice_only' && product !== 'complete_pack') return null;

  const basePath = path.join(process.cwd(), 'config', 'mqs', product, `${jurisdiction}.yaml`);

  if (!fs.existsSync(basePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(basePath, 'utf8');
  const parsed = yaml.load(fileContents) as MasterQuestionSet;

  return parsed;
}

// Determine the next question from an MQS definition and current facts
export function getNextMQSQuestion(
  mqs: MasterQuestionSet,
  collectedFacts: Record<string, any>,
): ExtendedWizardQuestion | null {
  const answered = collectedFacts || {};

  for (const q of mqs.questions) {
    // dependency check
    if (q.dependsOn) {
      const depValue = answered[q.dependsOn.questionId];
      if (Array.isArray(q.dependsOn.value)) {
        if (!q.dependsOn.value.includes(depValue)) continue;
      } else if (depValue !== q.dependsOn.value) {
        continue;
      }
    }

    // group questions: check all fields
    if (q.inputType === 'group' && q.fields && q.fields.length > 0) {
      const allFieldsAnswered = q.fields.every((f) => {
        const value = answered[f.id];
        if (f.validation?.required) {
          return value !== undefined && value !== null && value !== '';
        }
        return true;
      });

      if (!allFieldsAnswered) return q;
    } else {
      // simple question
      const value = answered[q.id];
      if (q.validation?.required && (value === undefined || value === null || value === '')) {
        return q;
      }
    }
  }

  return null; // no more questions
}
