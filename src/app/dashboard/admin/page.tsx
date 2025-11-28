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
              <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
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
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
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
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
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
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
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
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
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
