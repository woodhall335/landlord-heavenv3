/**
 * AI Module - Central exports
 *
 * Provides access to all AI functionality:
 * - OpenAI (GPT-4) for fact-finding and chat
 * - Claude (Sonnet 4) for QA validation
 * - Token tracking for cost monitoring
 */

// OpenAI exports
export {
  chatCompletion,
  jsonCompletion,
  streamChatCompletion,
  openai,
  type ChatMessage,
  type ChatCompletionOptions,
  type ChatCompletionResult,
} from './openai-client';

// Claude exports
export {
  claudeCompletion,
  claudeJsonCompletion,
  streamClaudeCompletion,
  anthropic,
  type ClaudeMessage,
  type ClaudeCompletionOptions,
  type ClaudeCompletionResult,
} from './claude-client';

// Fact-finding wizard exports
export {
  getNextQuestion,
  validateAnswer,
  type WizardQuestion,
  type FactFinderRequest,
  type FactFinderResponse,
} from './fact-finder';

// QA validation exports
export {
  validateDocument,
  batchValidateDocuments,
  meetsQualityThreshold,
  getCriticalIssues,
  getActionableSuggestions,
  type QAValidationRequest,
  type QAValidationResult,
  type QAIssue,
} from './qa-validator';

// Token tracking exports
export {
  trackTokenUsage,
  getUserTokenStats,
  getPlatformTokenStats,
  type TokenUsage,
} from './token-tracker';
