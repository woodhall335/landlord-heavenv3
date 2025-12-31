'use client';

import { Lock, Download, FileText, ClipboardList, CheckSquare, Shield, Scale, FileCheck, Home, Users, BookOpen, AlertTriangle } from 'lucide-react';

export interface DocumentInfo {
  id: string;
  title: string;
  description: string;
  icon: 'notice' | 'guidance' | 'checklist' | 'compliance' | 'court-form' | 'ai-generated' | 'agreement' | 'schedule' | 'evidence';
  pages?: string;
  category?: string;
}

interface DocumentCardProps {
  document: DocumentInfo;
  isLocked: boolean;
  onUnlock: () => void;
  onDownload?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'notice': FileText,
  'guidance': BookOpen,
  'checklist': CheckSquare,
  'compliance': Shield,
  'court-form': Scale,
  'ai-generated': FileCheck,
  'agreement': Home,
  'schedule': Users,
  'evidence': ClipboardList,
};

export function DocumentCard({ document, isLocked, onUnlock, onDownload }: DocumentCardProps) {
  const IconComponent = iconMap[document.icon] || FileText;

  return (
    <div className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all ${isLocked ? 'border-gray-200' : 'border-primary/20'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 ${isLocked ? 'bg-gray-100' : 'bg-purple-100'}`}>
          <IconComponent className={`w-6 h-6 ${isLocked ? 'text-gray-400' : 'text-primary'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{document.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{document.description}</p>
          <div className="flex items-center gap-3 mt-2">
            {document.pages && (
              <span className="text-xs text-gray-400">{document.pages}</span>
            )}
            {document.category && (
              <span className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                {document.category}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isLocked ? (
            <button
              onClick={onUnlock}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Unlock</span>
            </button>
          ) : (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
