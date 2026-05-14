import type { GoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { GoldenPackPdfShowcase } from '@/components/marketing/GoldenPackPdfShowcase';

export function GoldenPackProof({
  data,
}: {
  data: GoldenPackProofData;
  samplePageHref?: string;
  samplePageLabel?: string;
}) {
  const pdfEntries = data.featuredEntries.filter((entry) => Boolean(entry.pdfHref));

  return pdfEntries.length ? <GoldenPackPdfShowcase entries={pdfEntries} /> : null;
}
