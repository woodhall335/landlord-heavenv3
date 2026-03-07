export type CompletePackPreviewCategory = 'Notices' | 'Court Forms' | 'AI-Generated' | 'Guidance' | 'Evidence';

export interface CompletePackPreviewDocument {
  id: string;
  title: string;
  category: CompletePackPreviewCategory;
  previewPath: string;
}

export const section8Documents: CompletePackPreviewDocument[] = [
  { id: 'notice', title: 'Section 8 Notice (Form 3)', category: 'Notices', previewPath: '/images/previews/complete-pack/england/section8/notice.webp' },
  { id: 'n5', title: 'Form N5 — Claim for Possession', category: 'Court Forms', previewPath: '/images/previews/complete-pack/england/section8/n5.webp' },
  { id: 'n119', title: 'Form N119 — Particulars of Claim', category: 'Court Forms', previewPath: '/images/previews/complete-pack/england/section8/n119.webp' },
  { id: 'witness', title: 'AI Witness Statement', category: 'AI-Generated', previewPath: '/images/previews/complete-pack/england/section8/witness-statement.webp' },
  { id: 'arrears-letter', title: 'Arrears Engagement Letter', category: 'Guidance', previewPath: '/images/previews/complete-pack/england/section8/arrears-engagement-letter.webp' },
  { id: 'case-summary', title: 'Case Summary', category: 'Guidance', previewPath: '/images/previews/complete-pack/england/section8/case-summary.webp' },
  { id: 'court-index', title: 'Court Bundle Index', category: 'Guidance', previewPath: '/images/previews/complete-pack/england/section8/court-bundle-index.webp' },
  { id: 'evidence-checklist', title: 'Evidence Checklist', category: 'Evidence', previewPath: '/images/previews/complete-pack/england/section8/evidence-checklist.webp' },
  { id: 'hearing-checklist', title: 'Hearing Checklist', category: 'Guidance', previewPath: '/images/previews/complete-pack/england/section8/hearing-checklist.webp' },
  { id: 'proof-service', title: 'Proof of Service Certificate', category: 'Evidence', previewPath: '/images/previews/complete-pack/england/section8/proof-of-service.webp' }
];

export const section21Documents: CompletePackPreviewDocument[] = [
  { id: 'notice', title: 'Section 21 Notice (Form 6A)', category: 'Notices', previewPath: '/images/previews/complete-pack/england/section21/notice.webp' },
  { id: 'n5b', title: 'Form N5B — Accelerated Possession', category: 'Court Forms', previewPath: '/images/previews/complete-pack/england/section21/n5b.webp' },
  { id: 'witness', title: 'AI Witness Statement', category: 'AI-Generated', previewPath: '/images/previews/complete-pack/england/section21/witness-statement.webp' },
  { id: 'case-summary', title: 'Case Summary', category: 'Guidance', previewPath: '/images/previews/complete-pack/england/section21/case-summary.webp' },
  { id: 'court-index', title: 'Court Bundle Index', category: 'Guidance', previewPath: '/images/previews/complete-pack/england/section21/court-bundle-index.webp' },
  { id: 'evidence-checklist', title: 'Evidence Checklist', category: 'Evidence', previewPath: '/images/previews/complete-pack/england/section21/evidence-checklist.webp' },
  { id: 'hearing-checklist', title: 'Hearing Checklist', category: 'Guidance', previewPath: '/images/previews/complete-pack/england/section21/hearing-checklist.webp' },
  { id: 'proof-service', title: 'Proof of Service Certificate', category: 'Evidence', previewPath: '/images/previews/complete-pack/england/section21/proof-of-service.webp' }
];
