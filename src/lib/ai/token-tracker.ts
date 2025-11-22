/**
 * Token Tracker
 *
 * Tracks AI token usage and costs across the platform
 * Stores data in Supabase for analytics and billing
 */

import { createAdminClient } from '@/lib/supabase/server';

export interface TokenUsage {
  user_id: string;
  model: string;
  operation: 'fact_finding' | 'qa_validation' | 'document_generation' | 'chat';
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  case_id?: string;
  document_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Log token usage to database
 */
export async function trackTokenUsage(usage: TokenUsage): Promise<void> {
  try {
    const supabase = createAdminClient();

    // Store in ai_usage table (create this table in migration)
    await supabase.from('ai_usage').insert({
      user_id: usage.user_id,
      model: usage.model,
      operation: usage.operation,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      cost_usd: usage.cost_usd,
      case_id: usage.case_id || null,
      document_id: usage.document_id || null,
      metadata: usage.metadata || {},
      created_at: new Date().toISOString(),
    });

    console.log(`✅ Tracked ${usage.total_tokens} tokens for ${usage.operation} (${usage.model}) - $${usage.cost_usd.toFixed(6)}`);
  } catch (error) {
    console.error('Failed to track token usage:', error);
    // Don't throw - logging failure shouldn't break the app
  }
}

/**
 * Get total token usage for a user
 */
export async function getUserTokenStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  total_tokens: number;
  total_cost_usd: number;
  by_operation: Record<string, { tokens: number; cost: number }>;
  by_model: Record<string, { tokens: number; cost: number }>;
}> {
  const supabase = createAdminClient();

  let query = supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data: usages } = await query;

  if (!usages || usages.length === 0) {
    return {
      total_tokens: 0,
      total_cost_usd: 0,
      by_operation: {},
      by_model: {},
    };
  }

  const totalTokens = usages.reduce((sum, u) => sum + u.total_tokens, 0);
  const totalCost = usages.reduce((sum, u) => sum + parseFloat(String(u.cost_usd)), 0);

  // Group by operation
  const byOperation = usages.reduce((acc, u) => {
    if (!acc[u.operation]) {
      acc[u.operation] = { tokens: 0, cost: 0 };
    }
    acc[u.operation].tokens += u.total_tokens;
    acc[u.operation].cost += parseFloat(String(u.cost_usd));
    return acc;
  }, {} as Record<string, { tokens: number; cost: number }>);

  // Group by model
  const byModel = usages.reduce((acc, u) => {
    if (!acc[u.model]) {
      acc[u.model] = { tokens: 0, cost: 0 };
    }
    acc[u.model].tokens += u.total_tokens;
    acc[u.model].cost += parseFloat(String(u.cost_usd));
    return acc;
  }, {} as Record<string, { tokens: number; cost: number }>);

  return {
    total_tokens: totalTokens,
    total_cost_usd: totalCost,
    by_operation: byOperation,
    by_model: byModel,
  };
}

/**
 * Get platform-wide token stats (admin only)
 */
export async function getPlatformTokenStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total_tokens: number;
  total_cost_usd: number;
  total_users: number;
  by_operation: Record<string, { tokens: number; cost: number; count: number }>;
  by_model: Record<string, { tokens: number; cost: number; count: number }>;
  top_users: Array<{ user_id: string; tokens: number; cost: number }>;
}> {
  const supabase = createAdminClient();

  let query = supabase.from('ai_usage').select('*');

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data: usages } = await query;

  if (!usages || usages.length === 0) {
    return {
      total_tokens: 0,
      total_cost_usd: 0,
      total_users: 0,
      by_operation: {},
      by_model: {},
      top_users: [],
    };
  }

  const totalTokens = usages.reduce((sum, u) => sum + u.total_tokens, 0);
  const totalCost = usages.reduce((sum, u) => sum + parseFloat(String(u.cost_usd)), 0);
  const uniqueUsers = new Set(usages.map((u) => u.user_id)).size;

  // Group by operation
  const byOperation = usages.reduce((acc, u) => {
    if (!acc[u.operation]) {
      acc[u.operation] = { tokens: 0, cost: 0, count: 0 };
    }
    acc[u.operation].tokens += u.total_tokens;
    acc[u.operation].cost += parseFloat(String(u.cost_usd));
    acc[u.operation].count += 1;
    return acc;
  }, {} as Record<string, { tokens: number; cost: number; count: number }>);

  // Group by model
  const byModel = usages.reduce((acc, u) => {
    if (!acc[u.model]) {
      acc[u.model] = { tokens: 0, cost: 0, count: 0 };
    }
    acc[u.model].tokens += u.total_tokens;
    acc[u.model].cost += parseFloat(String(u.cost_usd));
    acc[u.model].count += 1;
    return acc;
  }, {} as Record<string, { tokens: number; cost: number; count: number }>);

  // Top users
  const userStats = usages.reduce((acc, u) => {
    if (!acc[u.user_id]) {
      acc[u.user_id] = { tokens: 0, cost: 0 };
    }
    acc[u.user_id].tokens += u.total_tokens;
    acc[u.user_id].cost += parseFloat(String(u.cost_usd));
    return acc;
  }, {} as Record<string, { tokens: number; cost: number }>);

  const topUsers = Object.entries(userStats)
    .map(([user_id, stats]) => ({ user_id, ...stats }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return {
    total_tokens: totalTokens,
    total_cost_usd: totalCost,
    total_users: uniqueUsers,
    by_operation: byOperation,
    by_model: byModel,
    top_users: topUsers,
  };
}
