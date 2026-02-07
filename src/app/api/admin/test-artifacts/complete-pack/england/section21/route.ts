/**
 * Admin API - Generate Test Artifacts (Complete Pack - England Section 21)
 *
 * POST /api/admin/test-artifacts/complete-pack/england/section21
 */

import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { generateCompleteEvictionPack } from '@/lib/documents/eviction-pack-generator';
import { buildEnglandSection21CompletePackFacts } from '@/lib/testing/fixtures/complete-pack';
import { registerArtifactDownload } from '@/lib/test-artifacts/artifactDownloadStore';
import { saveCompletePackArtifacts } from '@/lib/test-artifacts/saveCompletePackArtifacts';
import { validateCompletePackDocuments } from '@/lib/test-artifacts/validateCompletePackDocuments';
import { setupTestAI } from '@/lib/test-artifacts/setupTestAI';

export async function POST() {
  try {
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    setupTestAI();

    const pack = await generateCompleteEvictionPack(buildEnglandSection21CompletePackFacts());
    const validation = validateCompletePackDocuments({
      documents: pack.documents,
      jurisdiction: 'england',
      route: 'section_21',
    });

    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 422 });
    }

    const result = await saveCompletePackArtifacts({
      packSlug: 'complete-pack',
      variant: 'section21',
      jurisdiction: 'england',
      documents: pack.documents,
      metadata: pack.metadata,
    });
    const download = result.zipPath ? registerArtifactDownload(result.zipPath) : null;

    return NextResponse.json({
      ok: true,
      outputDir: result.outputDir,
      docCount: result.docs.length,
      docs: result.docs.map(({ key, filename }) => ({ key, filename })),
      storage: result.storage,
      downloadUrl: download
        ? `/api/admin/test-artifacts/complete-pack/download?token=${download.token}`
        : undefined,
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin test artifacts (section21) error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
