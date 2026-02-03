/**
 * Admin API - Legal Change Events
 *
 * GET /api/admin/legal-change/events
 * Lists legal change events with filtering and pagination
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 * Updated to use database persistence instead of in-memory storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  dbListEvents,
  dbGetEventSummaries,
  dbCountEventsByState,
  dbGetEventsRequiringAttention,
  dbGetEventCount,
} from '@/lib/validation/legal-change-db';
import {
  EventState,
  EventFilter,
  ChangeSeverity,
} from '@/lib/validation/legal-change-events';
import { Jurisdiction, LegalTopic } from '@/lib/validation/legal-source-registry';

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
      const [counts, recentEvents, totalEvents] = await Promise.all([
        dbCountEventsByState(),
        dbGetEventSummaries(),
        dbGetEventCount(),
      ]);

      const requiresTriage = counts.new;
      const requiresAction = counts.action_required;

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalEvents,
            byState: counts,
            requiresTriage,
            requiresAction,
            avgTimeToTriage: null,
            avgTimeToClose: null,
          },
          recentEvents: recentEvents.slice(0, 10),
          sourceStats: {
            totalSources: 0,
            enabledSources: 0,
            byJurisdiction: {},
          },
          recentActivity: [],
        },
        meta: { timestamp: new Date().toISOString() },
      });
    }

    if (view === 'attention') {
      const events = await dbGetEventsRequiringAttention();
      const summaries = events.map((e) => ({
        id: e.id,
        title: e.title,
        state: e.state,
        severity: e.impactAssessment?.severity,
        jurisdictions: e.jurisdictions,
        sourceId: e.sourceId,
        detectedAt: e.detectedAt,
        impactedRuleCount: e.impactAssessment?.impactedRuleIds.length ?? 0,
        assignedTo: e.assignedTo,
      }));

      return NextResponse.json({
        success: true,
        data: summaries,
        meta: {
          totalCount: summaries.length,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (view === 'counts') {
      const counts = await dbCountEventsByState();
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

    // Get events from database
    const allEvents = await dbListEvents(Object.keys(filter).length > 0 ? filter : undefined);

    // Apply pagination
    const totalCount = allEvents.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const events = allEvents.slice(start, start + pageSize);

    // Convert to summaries
    const summaries = events.map((e) => ({
      id: e.id,
      title: e.title,
      state: e.state,
      severity: e.impactAssessment?.severity,
      jurisdictions: e.jurisdictions,
      sourceId: e.sourceId,
      detectedAt: e.detectedAt,
      impactedRuleCount: e.impactAssessment?.impactedRuleIds.length ?? 0,
      assignedTo: e.assignedTo,
    }));

    return NextResponse.json({
      success: true,
      data: summaries,
      meta: {
        totalCount,
        page,
        pageSize,
        totalPages,
        timestamp: new Date().toISOString(),
      },
    });
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
