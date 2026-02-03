/**
 * Admin Dashboard
 *
 * Platform statistics and management for administrators
 * Requires admin access (user ID in ADMIN_USER_IDS env var)
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RiLockLine, RiGroupLine, RiFileTextLine, RiMoneyDollarCircleLine, RiWalletLine, RiMailLine, RiAlertLine, RiCpuLine, RiScales3Line } from 'react-icons/ri';

interface AdminStats {
  users: {
    total: number;
    verified: number;
    subscribers: number;
    new_this_month: number;
  };
  cases: {
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
  };
  documents: {
    total: number;
    previews: number;
    final: number;
  };
  revenue: {
    total_all_time: number;
    this_month: number;
    last_month: number;
    subscriptions_mrr: number;
  };
  ai_usage: {
    total_tokens: number;
    total_cost_usd: number;
    this_month_cost: number;
  };
  leads: {
    total: number;
    this_month: number;
  };
}

interface RecentOrder {
  id: string;
  user_email: string;
  product_name: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
}

export default function AdminDashboardPage() {
  // const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAccessAndFetch();
  }, []);

  const checkAccessAndFetch = async () => {
    try {
      // Check if user is admin
      const checkResponse = await fetch('/api/admin/check-access');

      if (checkResponse.status === 403) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      if (!checkResponse.ok) {
        setError('Failed to verify admin access');
        setIsLoading(false);
        return;
      }

      setHasAccess(true);

      // Fetch admin stats
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?limit=10'),
        fetch('/api/admin/users?limit=10'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.orders || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setRecentUsers(usersData.users || []);
      }
    } catch {
      setError('Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `£${(amount / 100).toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getRevenueGrowth = (): number => {
    if (!stats || stats.revenue.last_month === 0) return 0;
    return Math.round(
      ((stats.revenue.this_month - stats.revenue.last_month) / stats.revenue.last_month) * 100
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // No access - show error
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card padding="large">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiLockLine className="w-10 h-10 text-[#7C3AED]" />
            </div>

            <h2 className="text-2xl font-bold text-charcoal mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You do not have permission to access the admin dashboard. Only platform
              administrators can access this area.
            </p>

            <Link href="/dashboard">
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="large">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-charcoal mb-2">{error || 'Failed to load stats'}</h2>
            <Link href="/dashboard">
              <button className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <Container size="large" className="py-6">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-white/80 hover:text-white font-medium mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold">🔧 Admin Dashboard</h1>
            <p className="opacity-90 mt-1">Platform statistics and management</p>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card padding="medium">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <RiGroupLine className="w-5 h-5 text-[#7C3AED]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-charcoal">{stats.users.total.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">
              +{stats.users.new_this_month} this month
            </div>
          </Card>

          {/* Total Cases */}
          <Card padding="medium">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">Total Cases</div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <RiFileTextLine className="w-5 h-5 text-[#7C3AED]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-charcoal">{stats.cases.total.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.cases.by_status.completed || 0} completed
            </div>
          </Card>

          {/* Revenue This Month */}
          <Card padding="medium">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">Revenue (Month)</div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <RiMoneyDollarCircleLine className="w-5 h-5 text-[#7C3AED]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-charcoal">
              {formatCurrency(stats.revenue.this_month)}
            </div>
            <div className={`text-xs mt-1 ${getRevenueGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {getRevenueGrowth() >= 0 ? '+' : ''}{getRevenueGrowth()}% vs last month
            </div>
          </Card>

          {/* MRR */}
          <Card padding="medium">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">Subscription MRR</div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <RiWalletLine className="w-5 h-5 text-[#7C3AED]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-charcoal">
              {formatCurrency(stats.revenue.subscriptions_mrr)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.users.subscribers} subscribers
            </div>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/admin/orders" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <RiFileTextLine className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-medium text-charcoal">Orders</p>
            <p className="text-xs text-gray-500">Manage & refund</p>
          </Link>
          <Link href="/dashboard/admin/users" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <RiGroupLine className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-medium text-charcoal">Users</p>
            <p className="text-xs text-gray-500">View accounts</p>
          </Link>
          <Link href="/dashboard/admin/leads" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <RiMailLine className="w-5 h-5 text-amber-600" />
            </div>
            <p className="font-medium text-charcoal">Email Leads</p>
            <p className="text-xs text-gray-500">{stats.leads?.total || 0} captured</p>
          </Link>
          <Link href="/dashboard/admin/email-previews" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <RiMailLine className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-medium text-charcoal">Email Previews</p>
            <p className="text-xs text-gray-500">View templates</p>
          </Link>
          <Link href="/dashboard/admin/ai-usage" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <RiCpuLine className="w-5 h-5 text-orange-600" />
            </div>
            <p className="font-medium text-charcoal">AI Usage</p>
            <p className="text-xs text-gray-500">Cost tracking</p>
          </Link>
          <Link href="/dashboard/admin/failed-payments" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
              <RiAlertLine className="w-5 h-5 text-red-600" />
            </div>
            <p className="font-medium text-charcoal">Failed Payments</p>
            <p className="text-xs text-gray-500">Review issues</p>
          </Link>
          <Link href="/dashboard/admin/legal-changes" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <RiScales3Line className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="font-medium text-charcoal">Legal Changes</p>
            <p className="text-xs text-gray-500">Monitor updates</p>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <Card padding="large">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Recent Orders</h2>
                <Link href="/dashboard/admin/orders" className="text-sm text-primary hover:text-primary-dark font-medium">
                  View all →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-charcoal truncate">
                          {order.product_name}
                        </div>
                        <div className="text-sm text-gray-600">{order.user_email}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-charcoal">
                            {formatCurrency(order.total_amount)}
                          </div>
                          <Badge variant={getPaymentStatusColor(order.payment_status)} size="small">
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Users */}
            <Card padding="large">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Recent Users</h2>
                <Link href="/dashboard/admin/users" className="text-sm text-primary hover:text-primary-dark font-medium">
                  View all →
                </Link>
              </div>

              {recentUsers.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-charcoal">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-600 truncate">{user.email}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Joined {formatDate(user.created_at)}
                        </div>
                      </div>
                      {user.subscription_tier && (
                        <Badge variant="success" size="small">
                          HMO Pro
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Stats Breakdown */}
          <div className="space-y-6">
            {/* Cases by Type */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Cases by Type</h3>
              <div className="space-y-3">
                {Object.entries(stats.cases.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="font-medium text-charcoal">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Documents */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Documents</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-medium text-charcoal">{stats.documents.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Previews</span>
                  <span className="font-medium text-charcoal">{stats.documents.previews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Final</span>
                  <span className="font-medium text-charcoal">{stats.documents.final}</span>
                </div>
              </div>
            </Card>

            {/* API Usage */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">API Usage</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tokens</span>
                  <span className="font-medium text-charcoal">
                    {stats.ai_usage.total_tokens.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Cost</span>
                  <span className="font-medium text-charcoal">
                    ${stats.ai_usage.total_cost_usd.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-medium text-charcoal">
                    ${stats.ai_usage.this_month_cost.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Revenue Breakdown */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Revenue</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">All Time</span>
                  <span className="font-medium text-charcoal">
                    {formatCurrency(stats.revenue.total_all_time)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-medium text-charcoal">
                    {formatCurrency(stats.revenue.this_month)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span className="font-medium text-charcoal">
                    {formatCurrency(stats.revenue.last_month)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
