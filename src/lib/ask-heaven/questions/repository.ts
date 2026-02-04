/**
 * Ask Heaven Question Repository
 *
 * Abstract persistence layer for Ask Heaven questions.
 * This abstraction allows switching between:
 * - In-memory store (development/testing)
 * - Supabase (production)
 * - File-based (static site generation)
 *
 * IMPORTANT: Do not import database-specific code directly.
 * Use the repository interface for all question operations.
 */

import type {
  AskHeavenQuestion,
  AskHeavenQuestionListItem,
  AskHeavenQuestionSitemapEntry,
  AskHeavenQuestionStatus,
  AskHeavenPrimaryTopic,
  AskHeavenJurisdiction,
  CreateAskHeavenQuestionInput,
  UpdateAskHeavenQuestionInput,
  DuplicateCheckResult,
} from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { createAdminClient, tryCreateServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Repository interface for Ask Heaven questions.
 *
 * Implementations:
 * - InMemoryQuestionRepository: For development/testing
 * - SupabaseQuestionRepository: For production (TODO)
 * - StaticQuestionRepository: For SSG builds (TODO)
 */
export interface AskHeavenQuestionRepository {
  /**
   * Get a question by its unique slug.
   * Returns null if not found.
   */
  getBySlug(slug: string): Promise<AskHeavenQuestion | null>;

  /**
   * Get a question by its ID.
   * Returns null if not found.
   */
  getById(id: string): Promise<AskHeavenQuestion | null>;

  /**
   * List all questions with optional filtering.
   */
  list(options?: {
    status?: AskHeavenQuestionStatus;
    topic?: AskHeavenPrimaryTopic;
    jurisdiction?: AskHeavenJurisdiction;
    limit?: number;
    offset?: number;
  }): Promise<AskHeavenQuestionListItem[]>;

  /**
   * Get all approved questions for sitemap generation.
   * Only returns canonical URLs (canonical_slug === null).
   */
  getForSitemap(): Promise<AskHeavenQuestionSitemapEntry[]>;

  /**
   * Get related questions by slugs.
   */
  getRelatedQuestions(slugs: string[]): Promise<AskHeavenQuestionListItem[]>;

  /**
   * Create a new question.
   * Status defaults to 'draft'.
   */
  create(input: CreateAskHeavenQuestionInput): Promise<AskHeavenQuestion>;

  /**
   * Update an existing question.
   */
  update(input: UpdateAskHeavenQuestionInput): Promise<AskHeavenQuestion>;

  /**
   * Delete a question by ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a slug is already in use.
   */
  slugExists(slug: string): Promise<boolean>;

  /**
   * Count questions by status.
   */
  countByStatus(): Promise<Record<AskHeavenQuestionStatus, number>>;
}

const QUESTIONS_TABLE = 'ask_heaven_questions';

/**
 * Supabase repository implementation for production.
 */
export class SupabaseQuestionRepository implements AskHeavenQuestionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  private handleNotFound(error: any): null | never {
    if (error?.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  async getBySlug(slug: string): Promise<AskHeavenQuestion | null> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return this.handleNotFound(error);
    }

    return data as AskHeavenQuestion;
  }

  async getById(id: string): Promise<AskHeavenQuestion | null> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return this.handleNotFound(error);
    }

    return data as AskHeavenQuestion;
  }

  async list(options?: {
    status?: AskHeavenQuestionStatus;
    topic?: AskHeavenPrimaryTopic;
    jurisdiction?: AskHeavenJurisdiction;
    limit?: number;
    offset?: number;
  }): Promise<AskHeavenQuestionListItem[]> {
    let query = this.client
      .from(QUESTIONS_TABLE)
      .select(
        'id, slug, question, summary, primary_topic, jurisdictions, status, updated_at'
      )
      .order('updated_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.topic) {
      query = query.eq('primary_topic', options.topic);
    }
    if (options?.jurisdiction) {
      query = query.contains('jurisdictions', [options.jurisdiction]);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 100;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []) as AskHeavenQuestionListItem[];
  }

  async getForSitemap(): Promise<AskHeavenQuestionSitemapEntry[]> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select('slug, updated_at, status, canonical_slug')
      .eq('status', 'approved')
      .is('canonical_slug', null);

    if (error) throw error;
    return (data ?? []) as AskHeavenQuestionSitemapEntry[];
  }

  async getRelatedQuestions(slugs: string[]): Promise<AskHeavenQuestionListItem[]> {
    if (slugs.length === 0) return [];
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select(
        'id, slug, question, summary, primary_topic, jurisdictions, status, updated_at'
      )
      .in('slug', slugs)
      .eq('status', 'approved');

    if (error) throw error;
    return (data ?? []) as AskHeavenQuestionListItem[];
  }

  async create(input: CreateAskHeavenQuestionInput): Promise<AskHeavenQuestion> {
    const payload = {
      ...input,
      status: 'draft' as AskHeavenQuestionStatus,
      canonical_slug: input.canonical_slug ?? null,
      related_slugs: input.related_slugs ?? [],
    };

    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as AskHeavenQuestion;
  }

  async update(input: UpdateAskHeavenQuestionInput): Promise<AskHeavenQuestion> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .update(input)
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) throw error;
    return data as AskHeavenQuestion;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(QUESTIONS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async slugExists(slug: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return Boolean(data?.id);
  }

  async countByStatus(): Promise<Record<AskHeavenQuestionStatus, number>> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select('status');

    if (error) throw error;

    const counts: Record<AskHeavenQuestionStatus, number> = {
      draft: 0,
      review: 0,
      approved: 0,
    };

    for (const row of data ?? []) {
      const status = row.status as AskHeavenQuestionStatus;
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    }

    return counts;
  }

  async listApprovedCanonicals(): Promise<AskHeavenQuestionSitemapEntry[]> {
    return this.getForSitemap();
  }

  async listByStatus(status: AskHeavenQuestionStatus): Promise<AskHeavenQuestion[]> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as AskHeavenQuestion[];
  }

  async upsert(question: AskHeavenQuestion): Promise<AskHeavenQuestion> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .upsert(question, { onConflict: 'slug' })
      .select('*')
      .single();

    if (error) throw error;
    return data as AskHeavenQuestion;
  }

  async approve(slug: string): Promise<AskHeavenQuestion> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('slug', slug)
      .select('*')
      .single();

    if (error) throw error;
    return data as AskHeavenQuestion;
  }

  async setCanonical(slug: string, canonicalSlug: string | null): Promise<AskHeavenQuestion> {
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .update({ canonical_slug: canonicalSlug })
      .eq('slug', slug)
      .select('*')
      .single();

    if (error) throw error;
    return data as AskHeavenQuestion;
  }

  async search(queryText: string): Promise<AskHeavenQuestionListItem[]> {
    const query = `%${queryText}%`;
    const { data, error } = await this.client
      .from(QUESTIONS_TABLE)
      .select('*')
      .or(`slug.ilike.${query},question.ilike.${query}`);

    if (error) throw error;
    return (data ?? []) as unknown as AskHeavenQuestionListItem[];
  }
}

/**
 * In-memory repository implementation for development and testing.
 *
 * WARNING: Data is lost on server restart.
 * Use only for development/testing.
 */
export class InMemoryQuestionRepository implements AskHeavenQuestionRepository {
  private questions: Map<string, AskHeavenQuestion> = new Map();
  private slugIndex: Map<string, string> = new Map(); // slug -> id

  async getBySlug(slug: string): Promise<AskHeavenQuestion | null> {
    const id = this.slugIndex.get(slug);
    if (!id) return null;
    return this.questions.get(id) ?? null;
  }

  async getById(id: string): Promise<AskHeavenQuestion | null> {
    return this.questions.get(id) ?? null;
  }

  async list(options?: {
    status?: AskHeavenQuestionStatus;
    topic?: AskHeavenPrimaryTopic;
    jurisdiction?: AskHeavenJurisdiction;
    limit?: number;
    offset?: number;
  }): Promise<AskHeavenQuestionListItem[]> {
    let results = Array.from(this.questions.values());

    // Apply filters
    if (options?.status) {
      results = results.filter((q) => q.status === options.status);
    }
    if (options?.topic) {
      results = results.filter((q) => q.primary_topic === options.topic);
    }
    if (options?.jurisdiction) {
      results = results.filter((q) =>
        q.jurisdictions.includes(options.jurisdiction!)
      );
    }

    // Sort by updated_at descending
    results.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // Apply pagination
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 100;
    results = results.slice(offset, offset + limit);

    // Map to list items (exclude answer_md for performance)
    return results.map((q) => ({
      id: q.id,
      slug: q.slug,
      question: q.question,
      summary: q.summary,
      primary_topic: q.primary_topic,
      jurisdictions: q.jurisdictions,
      status: q.status,
      updated_at: q.updated_at,
    }));
  }

  async getForSitemap(): Promise<AskHeavenQuestionSitemapEntry[]> {
    return Array.from(this.questions.values())
      .filter((q) => q.status === 'approved' && q.canonical_slug === null)
      .map((q) => ({
        slug: q.slug,
        updated_at: q.updated_at,
        status: q.status,
        canonical_slug: q.canonical_slug,
      }));
  }

  async getRelatedQuestions(slugs: string[]): Promise<AskHeavenQuestionListItem[]> {
    const results: AskHeavenQuestionListItem[] = [];
    for (const slug of slugs) {
      const question = await this.getBySlug(slug);
      if (question && question.status === 'approved') {
        results.push({
          id: question.id,
          slug: question.slug,
          question: question.question,
          summary: question.summary,
          primary_topic: question.primary_topic,
          jurisdictions: question.jurisdictions,
          status: question.status,
          updated_at: question.updated_at,
        });
      }
    }
    return results;
  }

  async create(input: CreateAskHeavenQuestionInput): Promise<AskHeavenQuestion> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const question: AskHeavenQuestion = {
      id,
      slug: input.slug,
      question: input.question,
      answer_md: input.answer_md,
      summary: input.summary,
      primary_topic: input.primary_topic,
      jurisdictions: input.jurisdictions,
      status: 'draft', // Always start as draft
      canonical_slug: input.canonical_slug ?? null,
      related_slugs: input.related_slugs ?? [],
      created_at: now,
      updated_at: now,
      reviewed_at: null,
    };

    this.questions.set(id, question);
    this.slugIndex.set(input.slug, id);

    return question;
  }

  async update(input: UpdateAskHeavenQuestionInput): Promise<AskHeavenQuestion> {
    const existing = this.questions.get(input.id);
    if (!existing) {
      throw new Error(`Question not found: ${input.id}`);
    }

    const now = new Date().toISOString();
    const updated: AskHeavenQuestion = {
      ...existing,
      ...input,
      updated_at: now,
      // Set reviewed_at when status changes to approved
      reviewed_at:
        input.status === 'approved' && existing.status !== 'approved'
          ? now
          : existing.reviewed_at,
    };

    // Update slug index if slug changed
    if (input.slug && input.slug !== existing.slug) {
      this.slugIndex.delete(existing.slug);
      this.slugIndex.set(input.slug, input.id);
    }

    this.questions.set(input.id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const question = this.questions.get(id);
    if (question) {
      this.slugIndex.delete(question.slug);
      this.questions.delete(id);
    }
  }

  async slugExists(slug: string): Promise<boolean> {
    return this.slugIndex.has(slug);
  }

  async countByStatus(): Promise<Record<AskHeavenQuestionStatus, number>> {
    const counts: Record<AskHeavenQuestionStatus, number> = {
      draft: 0,
      review: 0,
      approved: 0,
    };

    for (const question of this.questions.values()) {
      counts[question.status]++;
    }

    return counts;
  }

  /**
   * Seed with test data (development only).
   */
  seed(questions: AskHeavenQuestion[]): void {
    for (const q of questions) {
      this.questions.set(q.id, q);
      this.slugIndex.set(q.slug, q.id);
    }
  }

  /**
   * Clear all data (testing only).
   */
  clear(): void {
    this.questions.clear();
    this.slugIndex.clear();
  }
}

/**
 * Singleton repository instance.
 *
 * In production, replace this with a database-backed implementation.
 * The in-memory version is suitable for development and testing.
 */
let repositoryInstance: AskHeavenQuestionRepository | null = null;

/**
 * Get the question repository instance.
 *
 * Uses lazy initialization to allow configuration before first use.
 */
export function getQuestionRepository(): AskHeavenQuestionRepository {
  if (!repositoryInstance) {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      repositoryInstance = new SupabaseQuestionRepository(createAdminClient());
    } else {
      repositoryInstance = new InMemoryQuestionRepository();
    }
  }

  return repositoryInstance;
}

/**
 * Get a Supabase-backed repository when server context is available.
 */
export async function getSupabaseQuestionRepository(): Promise<AskHeavenQuestionRepository> {
  const supabase = await tryCreateServerSupabaseClient();
  if (!supabase) {
    return new InMemoryQuestionRepository();
  }
  return new SupabaseQuestionRepository(supabase);
}

export function createSupabaseAdminQuestionRepository(): SupabaseQuestionRepository {
  return new SupabaseQuestionRepository(createAdminClient());
}

/**
 * Set a custom repository implementation.
 *
 * Useful for:
 * - Testing with mocks
 * - Switching to database-backed storage
 * - Static site generation
 */
export function setQuestionRepository(
  repository: AskHeavenQuestionRepository
): void {
  repositoryInstance = repository;
}
