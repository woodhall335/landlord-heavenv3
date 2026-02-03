/**
 * Admin API - Legal Change Events
 *
 * GET /api/admin/legal-change/events
 * Lists legal change events with filtering and pagination
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  apiListEvents,
  apiGetDashboard,
  apiGetAttentionRequired,
  ListEventsRequest,
} from '@/lib/validation/legal-change-api';
import {
  EventState,
  EventFilter,
  countEventsByState,
} from '@/lib/validation/legal-change-events';
import { Jurisdiction, LegalTopic } from '@/lib/validation/legal-source-registry';
import { ChangeSeverity } from '@/lib/validation/legal-change-events';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access (with proper trimming of env var)
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view'); // 'dashboard' | 'attention' | 'counts'

    // Handle special views
    if (view === 'dashboard') {
      const result = apiGetDashboard();
      return NextResponse.json(result);
    }

    if (view === 'attention') {
      const result = apiGetAttentionRequired();
      return NextResponse.json(result);
    }

    if (view === 'counts') {
      const counts = countEventsByState();
      return NextResponse.json({
        success: true,
        data: counts,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    // Parse filter parameters
    const states = searchParams.get('states')?.split(',') as EventState[] | undefined;
    const jurisdictions = searchParams.get('jurisdictions')?.split(',') as Jurisdiction[] | undefined;
    const topics = searchParams.get('topics')?.split(',') as LegalTopic[] | undefined;
    const severities = searchParams.get('severities')?.split(',') as ChangeSeverity[] | undefined;
    const sourceIds = searchParams.get('sourceIds')?.split(',') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const createdAfter = searchParams.get('createdAfter') || undefined;
    const createdBefore = searchParams.get('createdBefore') || undefined;
    const hasImpactAssessment = searchParams.get('hasImpactAssessment');
    const tags = searchParams.get('tags')?.split(',') || undefined;

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);
    const sortBy = (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'severity') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Build filter
    const filter: EventFilter = {};
    if (states?.length) filter.states = states;
    if (jurisdictions?.length) filter.jurisdictions = jurisdictions;
    if (topics?.length) filter.topics = topics;
    if (severities?.length) filter.severities = severities;
    if (sourceIds?.length) filter.sourceIds = sourceIds;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdAfter) filter.createdAfter = createdAfter;
    if (createdBefore) filter.createdBefore = createdBefore;
    if (hasImpactAssessment !== null) {
      filter.hasImpactAssessment = hasImpactAssessment === 'true';
    }
    if (tags?.length) filter.tags = tags;

    // Build request
    const listRequest: ListEventsRequest = {
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    };

    const result = apiListEvents(listRequest);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Legal Change Events] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
