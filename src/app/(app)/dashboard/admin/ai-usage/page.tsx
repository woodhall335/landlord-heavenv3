"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Note: Admin access check now uses server-side /api/admin/check-access
// which properly handles whitespace in ADMIN_USER_IDS env var

interface AIUsageLog {
  id: string;
  operation_type: string;  // Correct field name from schema
  model: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_cost_usd: number | null;
  created_at: string;
  user_id?: string | null;
  case_id?: string | null;
}

interface AIUsageStats {
  totalCostAllTime: number;
  totalCostToday: number;
  totalCostThisWeek: number;
  totalCostThisMonth: number;
  totalTokens: number;
  avgCostPerOperation: number;
  costsByOperation: Record<string, { count: number; totalCost: number }>;
  recentLogs: AIUsageLog[];
}

export default function AdminAIUsagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AIUsageStats | null>(null);

  const checkAdminAccess = useCallback(async () => {
    try {
      // Use server-side admin check for security (handles env var trimming)
      const response = await fetch("/api/admin/check-access");

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        console.error("Error checking admin access:", response.statusText);
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    }
  }, [router]);

  const loadAIUsageStats = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    try {
      // Fetch all AI usage logs
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const logs = (data || []) as unknown as AIUsageLog[];

      // Calculate date ranges
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate stats
      const totalCostAllTime = logs.reduce((sum, log) => sum + (log.total_cost_usd || 0), 0);
      const totalCostToday = logs
        .filter((log) => new Date(log.created_at) >= startOfToday)
        .reduce((sum, log) => sum + (log.total_cost_usd || 0), 0);
      const totalCostThisWeek = logs
        .filter((log) => new Date(log.created_at) >= startOfWeek)
        .reduce((sum, log) => sum + (log.total_cost_usd || 0), 0);
      const totalCostThisMonth = logs
        .filter((log) => new Date(log.created_at) >= startOfMonth)
        .reduce((sum, log) => sum + (log.total_cost_usd || 0), 0);

      const totalTokens = logs.reduce(
        (sum, log) => sum + (log.input_tokens || 0) + (log.output_tokens || 0),
        0
      );

      const avgCostPerOperation = logs.length > 0 ? totalCostAllTime / logs.length : 0;

      // Calculate costs by operation type
      const costsByOperation: Record<string, { count: number; totalCost: number }> = {};
      logs.forEach((log) => {
        const opType = log.operation_type || 'unknown';
        if (!costsByOperation[opType]) {
          costsByOperation[opType] = { count: 0, totalCost: 0 };
        }
        costsByOperation[opType].count++;
        costsByOperation[opType].totalCost += log.total_cost_usd || 0;
      });

      setStats({
        totalCostAllTime,
        totalCostToday,
        totalCostThisWeek,
        totalCostThisMonth,
        totalTokens,
        avgCostPerOperation,
        costsByOperation,
        recentLogs: logs.slice(0, 50),
      });
    } catch (error) {
      console.error("Error loading AI usage stats:", error);
    }
  }, []);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (loading) return;
    loadAIUsageStats();
  }, [loading, loadAIUsageStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </Container>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <p className="text-center text-gray-600">Failed to load AI usage statistics</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="large">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-charcoal mb-2">AI Usage & Costs</h1>
            <p className="text-gray-600">OpenAI API usage and cost tracking</p>
          </div>
        </div>

        {/* Cost Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Today</p>
            <p className="text-3xl font-bold text-charcoal">${stats.totalCostToday.toFixed(4)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-3xl font-bold text-charcoal">${stats.totalCostThisWeek.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-purple-600">${stats.totalCostThisMonth.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">All Time</p>
            <p className="text-3xl font-bold text-charcoal">${stats.totalCostAllTime.toFixed(2)}</p>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Tokens</p>
            <p className="text-2xl font-bold text-charcoal">{stats.totalTokens.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Operations</p>
            <p className="text-2xl font-bold text-charcoal">{stats.recentLogs.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Avg Cost / Operation</p>
            <p className="text-2xl font-bold text-charcoal">${stats.avgCostPerOperation.toFixed(4)}</p>
          </div>
        </div>

        {/* Costs by Operation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Costs by Operation</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Operation</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Count</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Total Cost</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Avg Cost</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.costsByOperation)
                  .sort((a, b) => b[1].totalCost - a[1].totalCost)
                  .map(([operation, data]) => (
                    <tr key={operation} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <span className="text-sm font-medium text-charcoal">{operation}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700">{data.count}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-charcoal">
                          ${data.totalCost.toFixed(4)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700">
                          ${(data.totalCost / data.count).toFixed(4)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent API Calls */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-charcoal">Recent API Calls</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Operation</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Model</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Tokens (In/Out)</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Cost</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <span className="text-sm text-gray-700">
                        {new Date(log.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">{log.operation_type}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-gray-600">{log.model}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">
                        {log.input_tokens?.toLocaleString() || 0} / {log.output_tokens?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-charcoal">
                        ${(log.total_cost_usd || 0).toFixed(4)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  );
}
