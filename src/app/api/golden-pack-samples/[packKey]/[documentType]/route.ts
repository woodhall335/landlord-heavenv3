import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getGoldenPackAsset, isGoldenPackKey } from '@/lib/marketing/golden-pack-proof';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ packKey: string; documentType: string }> }
) {
  const { packKey, documentType } = await params;

  if (!isGoldenPackKey(packKey)) {
    return NextResponse.json({ error: 'Unknown sample pack' }, { status: 404 });
  }

  const asset = getGoldenPackAsset(packKey, decodeURIComponent(documentType), 'pdf');
  if (!asset) {
    return NextResponse.json({ error: 'Sample PDF not found' }, { status: 404 });
  }

  const file = await readFile(asset.absolutePath);

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      'Content-Type': asset.contentType,
      'Content-Disposition': `inline; filename="${asset.fileName}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}
