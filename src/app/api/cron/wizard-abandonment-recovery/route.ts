/** Compatibility endpoint. All recovery execution uses the unified orchestrator. */
import type { NextRequest } from 'next/server';
import { GET as orchestratorGet, POST as orchestratorPost } from '../recovery-orchestrator/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET(request: NextRequest) {
  return orchestratorGet(request);
}

export function POST(request: NextRequest) {
  return orchestratorPost(request);
}
