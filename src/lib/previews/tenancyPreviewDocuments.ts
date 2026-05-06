import {
  generatePremiumASTDocuments,
  generateStandardASTDocuments,
  type ASTData,
  type ASTPackDocument,
  type TenancyJurisdiction,
} from '@/lib/documents/ast-generator';
import {
  generateResidentialLettingDocuments,
  type ResidentialGeneratedDocument,
} from '@/lib/documents/residential-letting-generator';
import {
  isResidentialLettingProductSku,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

export type TenancyPreviewDocument = Pick<
  ASTPackDocument | ResidentialGeneratedDocument,
  'title' | 'description' | 'category' | 'document_type' | 'html' | 'file_name'
>;

interface ResolveTenancyPreviewDocumentInput {
  caseId: string;
  facts: Record<string, any>;
  jurisdiction: TenancyJurisdiction;
  tier: 'standard' | 'premium';
  product?: string | null;
  documentType?: string | null;
}

function normalizeDocumentKey(value: string | undefined | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_');
}

function documentMatches(document: TenancyPreviewDocument, requestedType: string): boolean {
  const actual = normalizeDocumentKey(document.document_type);
  const requested = normalizeDocumentKey(requestedType);
  return actual === requested;
}

function selectPreviewDocument(
  documents: TenancyPreviewDocument[],
  requestedType?: string | null
): TenancyPreviewDocument | undefined {
  if (!requestedType) return documents[0];

  const directMatch = documents.find((document) => documentMatches(document, requestedType));
  if (directMatch) return directMatch;

  const requested = normalizeDocumentKey(requestedType);

  if (requested === 'tenancy_agreement') {
    return documents.find((document) => document.category === 'agreement') || documents[0];
  }

  if (requested === 'tenancy_agreement_hmo') {
    return (
      documents.find(
        (document) =>
          document.category === 'agreement' &&
          normalizeDocumentKey(document.document_type).endsWith('_hmo')
      ) || documents[0]
    );
  }

  if (requested.includes('inventory')) {
    return documents.find((document) => normalizeDocumentKey(document.document_type).includes('inventory'));
  }

  if (requested.includes('compliance')) {
    return documents.find((document) => normalizeDocumentKey(document.document_type).includes('compliance'));
  }

  return undefined;
}

export async function resolveTenancyPreviewDocumentHtml({
  caseId,
  facts,
  jurisdiction,
  tier,
  product,
  documentType,
}: ResolveTenancyPreviewDocumentInput): Promise<TenancyPreviewDocument | null> {
  const generatedPack =
    product && isResidentialLettingProductSku(product)
      ? await generateResidentialLettingDocuments(product as ResidentialLettingProductSku, facts, {
          outputFormat: 'html',
        })
      : tier === 'premium'
        ? await generatePremiumASTDocuments({ ...facts, jurisdiction } as ASTData, caseId)
        : await generateStandardASTDocuments({ ...facts, jurisdiction } as ASTData, caseId);

  return selectPreviewDocument(generatedPack.documents, documentType) || null;
}

export function addPreviewWatermark(html: string): string {
  const watermarkStyle = `
    <style>
      body::before {
        content: "PREVIEW";
        position: fixed;
        top: 48%;
        left: 50%;
        z-index: 9999;
        transform: translate(-50%, -50%) rotate(-28deg);
        color: rgba(79, 70, 229, 0.14);
        font: 700 84px/1 Arial, sans-serif;
        letter-spacing: 0.08em;
        pointer-events: none;
        white-space: nowrap;
      }
      body::after {
        content: "Watermarked preview - clean downloads unlock after payment";
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 9999;
        border-radius: 999px;
        background: rgba(17, 24, 39, 0.78);
        color: #fff;
        padding: 8px 12px;
        font: 600 12px/1.2 Arial, sans-serif;
        pointer-events: none;
      }
    </style>
  `;

  if (html.includes('</head>')) {
    return html.replace('</head>', `${watermarkStyle}</head>`);
  }

  return `${watermarkStyle}${html}`;
}
