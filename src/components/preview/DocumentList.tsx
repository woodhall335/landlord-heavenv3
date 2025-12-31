'use client';

import { DocumentCard, DocumentInfo } from './DocumentCard';

interface DocumentListProps {
  documents: DocumentInfo[];
  isLocked: boolean;
  onUnlock: () => void;
  onDownload?: (documentId: string) => void;
  groupByCategory?: boolean;
}

export function DocumentList({
  documents,
  isLocked,
  onUnlock,
  onDownload,
  groupByCategory = true
}: DocumentListProps) {
  if (!groupByCategory) {
    return (
      <div className="space-y-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            isLocked={isLocked}
            onUnlock={onUnlock}
            onDownload={() => onDownload?.(doc.id)}
          />
        ))}
      </div>
    );
  }

  // Group documents by category
  const grouped = documents.reduce((acc, doc) => {
    const category = doc.category || 'Documents';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, DocumentInfo[]>);

  // Define category order
  const categoryOrder = [
    'Notice',
    'Court Forms',
    'AI-Generated',
    'Checklists',
    'Guidance',
    'Evidence',
    'Agreement',
    'Schedules',
    'Premium Extras',
    'Documents',
    'Pre-Action Protocol',
    'Court Documents',
    'Compliance',
    'Verification',
  ];

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {category} ({grouped[category].length})
          </h3>
          <div className="space-y-3">
            {grouped[category].map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                isLocked={isLocked}
                onUnlock={onUnlock}
                onDownload={() => onDownload?.(doc.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
