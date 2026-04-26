import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { getPackContents } from '@/lib/products/pack-contents';

type GoldenManifestDocument = {
  title: string;
  documentType: string;
};

type GoldenManifest = {
  key: string;
  documentCount: number;
  documents: GoldenManifestDocument[];
};

function readManifest(pack: 'notice_only' | 'complete_pack'): GoldenManifest {
  const manifestPath = path.join(process.cwd(), 'artifacts', 'golden-packs', pack, 'manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as GoldenManifest;
}

describe('England eviction golden-pack manifests', () => {
  it('notice_only manifest matches the canonical England pack contents when arrears support is included', () => {
    const manifest = readManifest('notice_only');
    const canonical = getPackContents({
      product: 'notice_only',
      jurisdiction: 'england',
      route: 'section_8',
      grounds: ['Ground 8', 'Ground 10', 'Ground 11'],
      has_arrears: true,
      include_arrears_schedule: true,
    });

    expect(manifest.documentCount).toBe(canonical.length);
    expect(manifest.documents.map((document) => document.documentType)).toEqual(canonical.map((item) => item.key));
    expect(manifest.documents.map((document) => document.title)).toEqual(canonical.map((item) => item.title));
  });

  it('complete_pack manifest matches the canonical England pack contents', () => {
    const manifest = readManifest('complete_pack');
    const canonical = getPackContents({
      product: 'complete_pack',
      jurisdiction: 'england',
      route: 'section_8',
      grounds: ['Ground 8', 'Ground 10', 'Ground 11'],
      has_arrears: true,
      include_arrears_schedule: true,
    });

    expect(manifest.documentCount).toBe(canonical.length);
    expect(manifest.documents.map((document) => document.documentType)).toEqual(canonical.map((item) => item.key));
    expect(manifest.documents.map((document) => document.title)).toEqual(canonical.map((item) => item.title));
  });

  it('both England eviction packs include the official N215 proof of service output', () => {
    const noticeManifest = readManifest('notice_only');
    const completeManifest = readManifest('complete_pack');

    expect(noticeManifest.documents.some((document) => document.documentType === 'proof_of_service')).toBe(true);
    expect(completeManifest.documents.some((document) => document.documentType === 'proof_of_service')).toBe(true);
    expect(noticeManifest.documents.some((document) => /Form N215/i.test(document.title))).toBe(true);
    expect(completeManifest.documents.some((document) => /Form N215/i.test(document.title))).toBe(true);
  });
});
