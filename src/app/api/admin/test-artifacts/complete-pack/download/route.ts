import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { consumeArtifactDownload } from '@/lib/test-artifacts/artifactDownloadStore';

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing download token' }, { status: 400 });
    }

    const entry = consumeArtifactDownload(token);

    if (!entry) {
      return NextResponse.json({ ok: false, error: 'Download token expired or invalid' }, { status: 404 });
    }

    const zipData = await fs.readFile(entry.zipPath);
    const filename = path.basename(entry.zipPath);
    await fs.rm(entry.zipPath, { force: true });

    return new NextResponse(zipData, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin test artifacts download error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
