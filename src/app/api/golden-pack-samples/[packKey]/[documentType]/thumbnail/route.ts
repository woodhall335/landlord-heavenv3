import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { pdfBytesToPreviewThumbnail } from '@/lib/documents/generator';
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

  const pdfBytes = await readFile(asset.absolutePath);
  const thumbnail = await pdfBytesToPreviewThumbnail(pdfBytes, {
    width: 480,
    height: 680,
    quality: 84,
    watermarkText: 'SAMPLE PREVIEW',
    documentId: `${packKey}-${documentType}-thumbnail`,
  });

  return new NextResponse(new Uint8Array(thumbnail), {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${asset.fileName.replace(/\.pdf$/i, '')}-thumbnail.jpg"`,
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}
