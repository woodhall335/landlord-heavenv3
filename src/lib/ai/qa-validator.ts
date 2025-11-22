/**
 * QA Validator
 *
 * Uses Claude Sonnet 4 to validate generated legal documents
 * Ensures documents meet quality standards (target: >85 score)
 */

import { claudeCompletion, ClaudeMessage } from './claude-client';

export interface QAValidationRequest {
  document_html: string;
  document_type: string;
  jurisdiction: string;
  case_type: string;
  collected_facts: Record<string, any>;
}

export interface QAIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'legal_accuracy' | 'completeness' | 'formatting' | 'clarity' | 'compliance';
  issue: string;
  suggestion: string;
  location?: string; // Where in the document the issue occurs
}

export interface QAValidationResult {
  score: number; // 0-100
  passed: boolean; // true if score >= 85
  issues: QAIssue[];
  summary: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_usd: number;
  };
}

/**
 * System prompt for QA validation
 */
const QA_SYSTEM_PROMPT = `You are an expert UK legal document reviewer specializing in landlord-tenant law.

Your role is to validate legal documents for accuracy, completeness, and compliance with UK law.

EVALUATION CRITERIA:
1. **Legal Accuracy (40%)** - Correct legal terminology, grounds, procedures
2. **Completeness (30%)** - All required information present, no missing fields
3. **Compliance (20%)** - Adherence to jurisdiction-specific requirements
4. **Clarity (10%)** - Plain English, understandable by non-lawyers

SCORING:
- 90-100: Excellent - Ready for court use
- 85-89: Good - Minor improvements needed
- 70-84: Acceptable - Significant improvements needed
- Below 70: Poor - Major issues, regeneration recommended

ISSUE SEVERITY:
- Critical: Legal errors that would invalidate the document
- High: Significant issues that reduce effectiveness
- Medium: Important improvements for clarity/compliance
- Low: Minor suggestions for enhancement

OUTPUT FORMAT:
Respond with JSON:
{
  "score": 85,
  "passed": true,
  "issues": [
    {
      "severity": "medium",
      "category": "completeness",
      "issue": "Description of the issue",
      "suggestion": "How to fix it",
      "location": "Section/paragraph identifier"
    }
  ],
  "summary": "Brief overall assessment"
}`;

/**
 * Validate a legal document using Claude
 */
export async function validateDocument(
  request: QAValidationRequest
): Promise<QAValidationResult> {
  const { document_html, document_type, jurisdiction, case_type, collected_facts } = request;

  const validationPrompt = `
**Document to Validate:**

Type: ${document_type}
Jurisdiction: ${jurisdiction}
Case Type: ${case_type}

**Collected Facts:**
${JSON.stringify(collected_facts, null, 2)}

**Document HTML:**
${document_html}

---

Please perform a comprehensive QA review of this legal document. Check for:
1. Legal accuracy and correct application of law
2. Completeness of all required information
3. Compliance with ${jurisdiction} requirements
4. Clarity and readability
5. Proper formatting and structure

Provide a detailed assessment with specific issues and suggestions for improvement.
`;

  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: validationPrompt,
    },
  ];

  try {
    const response = await claudeCompletion(messages, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.3, // Lower temperature for consistent evaluation
      max_tokens: 4096,
      system: QA_SYSTEM_PROMPT,
    });

    // Parse JSON response
    let parsedResponse: {
      score: number;
      passed: boolean;
      issues: QAIssue[];
      summary: string;
    };

    try {
      parsedResponse = JSON.parse(response.content);
    } catch (parseError) {
      // Fallback: Extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse QA validation response');
      }
    }

    return {
      score: parsedResponse.score,
      passed: parsedResponse.score >= 85,
      issues: parsedResponse.issues || [],
      summary: parsedResponse.summary || '',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        total_tokens: response.usage.total_tokens,
        cost_usd: response.cost_usd,
      },
    };
  } catch (error: any) {
    console.error('QA validation error:', error);
    throw new Error(`QA validation error: ${error.message}`);
  }
}

/**
 * Batch validate multiple documents
 */
export async function batchValidateDocuments(
  requests: QAValidationRequest[]
): Promise<QAValidationResult[]> {
  const results = await Promise.all(
    requests.map((request) => validateDocument(request))
  );

  return results;
}

/**
 * Check if document meets minimum quality threshold
 */
export function meetsQualityThreshold(
  result: QAValidationResult,
  threshold: number = 85
): boolean {
  return result.score >= threshold;
}

/**
 * Get critical issues that must be fixed
 */
export function getCriticalIssues(result: QAValidationResult): QAIssue[] {
  return result.issues.filter((issue) => issue.severity === 'critical');
}

/**
 * Get actionable suggestions for improvement
 */
export function getActionableSuggestions(result: QAValidationResult): string[] {
  return result.issues
    .filter((issue) => issue.severity === 'critical' || issue.severity === 'high')
    .map((issue) => issue.suggestion);
}
