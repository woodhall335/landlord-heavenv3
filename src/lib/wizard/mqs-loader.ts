/**
 * Master Question Set (MQS) Loader
 *
 * Loads deterministic question sets from YAML files for specific products and jurisdictions.
 * Used for eviction flows (notice_only, complete_pack) to replace AI-driven question selection.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type {
  ExtendedWizardQuestion,
  MasterQuestionSet,
  ProductType,
  Jurisdiction,
} from './types';

/**
 * Load MQS YAML file by product + jurisdiction
 * Returns null if:
 * - No MQS exists for this product/jurisdiction combination
 * - File doesn't exist
 * - Parsing fails
 */
export function loadMQS(product: ProductType, jurisdiction: string): MasterQuestionSet | null {
  // Only support E&W eviction MQS for now
  if (jurisdiction !== 'england-wales') return null;
  if (product !== 'notice_only' && product !== 'complete_pack') return null;

  const basePath = path.join(process.cwd(), 'config', 'mqs', product, `${jurisdiction}.yaml`);

  if (!fs.existsSync(basePath)) {
    console.warn(`[MQS Loader] No MQS file found at ${basePath}`);
    return null;
  }

  try {
    const fileContents = fs.readFileSync(basePath, 'utf8');
    const parsed = yaml.load(fileContents) as MasterQuestionSet;

    // Basic validation
    if (!parsed.id || !parsed.product || !parsed.questions || !Array.isArray(parsed.questions)) {
      console.error(`[MQS Loader] Invalid MQS structure in ${basePath}`);
      return null;
    }

    console.log(`[MQS Loader] Loaded MQS: ${parsed.id} with ${parsed.questions.length} questions`);
    return parsed;
  } catch (error) {
    console.error(`[MQS Loader] Failed to parse MQS file ${basePath}:`, error);
    return null;
  }
}

/**
 * Get the next unanswered question from an MQS definition
 *
 * Logic:
 * 1. Iterate through questions in array order
 * 2. Skip questions where dependsOn condition is not met
 * 3. For group questions: check if all required fields are answered
 * 4. For simple questions: check if the question ID is answered
 * 5. Return the first unanswered question, or null if all complete
 */
export function getNextMQSQuestion(
  mqs: MasterQuestionSet,
  collectedFacts: Record<string, any>,
): ExtendedWizardQuestion | null {
  const answered = collectedFacts || {};

  for (const q of mqs.questions) {
    // Check dependency
    if (q.dependsOn) {
      const depValue = answered[q.dependsOn.questionId];

      // Handle array of acceptable values
      if (Array.isArray(q.dependsOn.value)) {
        if (!q.dependsOn.value.includes(depValue)) {
          continue; // Dependency not met, skip this question
        }
      } else {
        // Exact match required
        if (depValue !== q.dependsOn.value) {
          continue; // Dependency not met, skip this question
        }
      }
    }

    // Group questions: check all fields
    if (q.inputType === 'group' && q.fields && q.fields.length > 0) {
      const allFieldsAnswered = q.fields.every((f) => {
        const value = answered[f.id];

        // If field is required, it must have a value
        if (f.validation?.required) {
          return value !== undefined && value !== null && value !== '';
        }

        // Optional fields don't block progression
        return true;
      });

      if (!allFieldsAnswered) {
        return q; // This group question has unanswered fields
      }
    } else {
      // Simple question: check if answered
      const value = answered[q.id];

      // For simple questions, we check the question ID itself
      if (q.validation?.required) {
        if (value === undefined || value === null || value === '') {
          return q; // This question is required and unanswered
        }
      }
    }
  }

  // All questions answered
  return null;
}

/**
 * Check if MQS is available for a given product + jurisdiction
 */
export function hasMQS(product: ProductType | null | undefined, jurisdiction: string): boolean {
  if (!product) return false;
  if (jurisdiction !== 'england-wales') return false;
  if (product !== 'notice_only' && product !== 'complete_pack') return false;

  const basePath = path.join(process.cwd(), 'config', 'mqs', product, `${jurisdiction}.yaml`);
  return fs.existsSync(basePath);
}

/**
 * Find a specific question by ID in an MQS
 */
export function findQuestionById(
  mqs: MasterQuestionSet,
  questionId: string,
): ExtendedWizardQuestion | null {
  return mqs.questions.find((q) => q.id === questionId) || null;
}
