/**
 * Unified recovery orchestrator.
 *
 * Chooses the highest-intent recovery email per customer/run:
 * checkout recovery > preview recovery > started-draft recovery.
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  getRecoveryOrchestratorConfig,
  runRecoveryOrchestrator,
} from '@/lib/recovery/orchestrator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function verifyCronAuth(request: NextRequest): { authorized: boolean; source: string } {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return { authorized: false, source: 'no_secret_configured' };
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, source: 'bearer' };
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    const keyParam = request.nextUrl.searchParams.get('key');
    if (keyParam && keyParam.length === cronSecret.length) {
      let match = true;
      for (let i = 0; i < cronSecret.length; i += 1) {
        if (keyParam[i] !== cronSecret[i]) {
          match = false;
        }
      }
      if (match) {
        return { authorized: true, source: 'vercel_cron' };
      }
    }

    return { authorized: false, source: 'vercel_cron_missing_key' };
  }

  return { authorized: false, source: 'invalid_credentials' };
}

function getPositiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getBooleanParam(value: string | null): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

async function execute(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = getRecoveryOrchestratorConfig();
    const result = await runRecoveryOrchestrator({
      dryRun: getBooleanParam(request.nextUrl.searchParams.get('dry_run')),
      batchLimit: getPositiveInteger(request.nextUrl.searchParams.get('limit'), config.batch_limit),
      triggeredBy: auth.source === 'bearer' ? 'manual' : 'cron',
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown recovery orchestrator error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  if (!authHeader && !vercelCronHeader) {
    return NextResponse.json({
      status: 'ok',
      ...getRecoveryOrchestratorConfig(),
      description:
        'Unified recovery job. Sends the highest-intent eligible email only: checkout, then preview, then draft.',
    });
  }

  return execute(request);
}

export async function POST(request: NextRequest) {
  return execute(request);
}
