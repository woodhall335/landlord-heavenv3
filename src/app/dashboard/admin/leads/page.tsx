/**
 * Admin Leads Dashboard
 *
 * View and export email leads captured from free tools
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  RiMailLine,
  RiDownloadLine,
  RiSearchLine,
  RiFilterLine,
  RiArrowLeftLine,
  RiRefreshLine,
  RiCalendarLine,
  RiPriceTag3Line,
} from 'react-icons/ri';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';

interface Lead {
  id: string;
  email: string;
  source: string | null;
  jurisdiction: string | null;
  tags: string[] | null;
  last_seen_at: string | null;
  created_at: string;
}

interface LeadsResponse {
  success: boolean;
  leads: Lead[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    today: number;
    thisWeek: number;
  };
  filters: {
    sources: string[];
  };
}

interface AdminLeadsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const LEADS_PER_PAGE = 50;

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatSource = (source: string | null) => {
  if (!source) return 'Unknown';
  return source
    .replace('tool:', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function getStartOfTodayUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getStartOfWeekUTC(date: Date) {
  const startOfToday = getStartOfTodayUTC(date);
  const dayOfWeek = startOfToday.getUTCDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setUTCDate(startOfToday.getUTCDate() - diffToMonday);
  return startOfWeek;
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  let user;
  try {
    user = await requireServerAuth();
  } catch {
    redirect('/auth/login');
  }

  if (!user || !isAdmin(user.id)) {
    redirect('/dashboard');
  }

  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const sourceFilter = typeof searchParams?.source === 'string' ? searchParams.source : '';
  const offsetParam = typeof searchParams?.offset === 'string' ? searchParams.offset : '0';
  const offsetValue = Number.parseInt(offsetParam, 10);
  const offset = Number.isNaN(offsetValue) ? 0 : Math.max(0, offsetValue);
  const limit = LEADS_PER_PAGE;

  // Admin pages use service-role client to bypass RLS for platform-wide data
  const adminClient = createAdminClient();

  let leads: Lead[] = [];
  let totalFiltered = 0;
  let errorMessage = '';

  let query = adminClient
    .from('email_subscribers')
    .select('id, email, source, jurisdiction, tags, last_seen_at, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (sourceFilter) {
    query = query.eq('source', sourceFilter);
  }
  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  const { data: leadRows, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to load leads:', error);
    errorMessage = 'Failed to load leads. Please try again.';
  } else {
    leads = leadRows || [];
    totalFiltered = count || 0;
  }

  const { data: sources } = await adminClient
    .from('email_subscribers')
    .select('source')
    .not('source', 'is', null);

  const uniqueSources = Array.from(
    new Set((sources || []).map((source) => source.source).filter(Boolean))
  ) as string[];

  const { count: totalCount } = await adminClient
    .from('email_subscribers')
    .select('*', { count: 'exact', head: true });

  const now = new Date();
  const startOfToday = getStartOfTodayUTC(now);
  const startOfWeek = getStartOfWeekUTC(now);

  const { count: todayCount } = await adminClient
    .from('email_subscribers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfToday.toISOString());

  const { count: weekCount } = await adminClient
    .from('email_subscribers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfWeek.toISOString());

  const data: LeadsResponse = {
    success: !error,
    leads,
    pagination: {
      total: totalFiltered,
      limit,
      offset,
      hasMore: totalFiltered > offset + limit,
    },
    stats: {
      total: totalCount || 0,
      today: todayCount || 0,
      thisWeek: weekCount || 0,
    },
    filters: {
      sources: uniqueSources,
    },
  };

  const refreshHref = buildQueryString({
    search: search || undefined,
    source: sourceFilter || undefined,
    offset: offset || undefined,
  });

  const exportHref = `/api/admin/leads${buildQueryString({
    format: 'csv',
    limit: 10000,
    search: search || undefined,
    source: sourceFilter || undefined,
  })}`;

  const previousOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  const previousHref = buildQueryString({
    search: search || undefined,
    source: sourceFilter || undefined,
    offset: previousOffset || undefined,
  });

  const nextHref = buildQueryString({
    search: search || undefined,
    source: sourceFilter || undefined,
    offset: nextOffset,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RiArrowLeftLine className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Leads</h1>
              <p className="text-gray-600">Manage leads captured from free tools</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/admin/leads${refreshHref}`}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RiRefreshLine className="w-5 h-5 text-gray-600" />
            </Link>
            <Link
              href={exportHref}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RiDownloadLine className="w-5 h-5" />
              Export CSV
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <RiMailLine className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.total.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <RiCalendarLine className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.today.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <RiPriceTag3Line className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.thisWeek.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <form method="get" className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="relative">
              <RiFilterLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="source"
                defaultValue={sourceFilter}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="">All Sources</option>
                {data?.filters.sources.map((source) => (
                  <option key={source} value={source}>
                    {formatSource(source)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </form>
        </Card>

        {/* Error State */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Leads Table */}
        {data && (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.leads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          No leads found
                        </td>
                      </tr>
                    ) : (
                      data.leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{lead.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="neutral">{formatSource(lead.source)}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {lead.tags?.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                              {(lead.tags?.length || 0) > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{(lead.tags?.length || 0) - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(lead.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {data.pagination.total === 0 ? 0 : offset + 1} to{' '}
                {Math.min(offset + limit, data.pagination.total)} of{' '}
                {data.pagination.total.toLocaleString()} leads
              </p>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/admin/leads${previousHref}`}
                  aria-disabled={offset === 0}
                  className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                    offset === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={`/dashboard/admin/leads${nextHref}`}
                  aria-disabled={!data.pagination.hasMore}
                  className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                    !data.pagination.hasMore ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
