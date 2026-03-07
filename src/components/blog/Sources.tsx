import { ExternalLink, Scale } from 'lucide-react';

export interface SourceLink {
  title: string;
  url: string;
  type: 'legislation' | 'government' | 'official' | 'reference';
}

interface SourcesProps {
  sources: SourceLink[];
}

/**
 * Displays official sources and references for legal/compliance posts
 * Improves EEAT signals by linking to authoritative sources
 */
export function Sources({ sources }: SourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const getTypeLabel = (type: SourceLink['type']) => {
    switch (type) {
      case 'legislation':
        return 'Legislation';
      case 'government':
        return 'Government';
      case 'official':
        return 'Official';
      default:
        return 'Reference';
    }
  };

  const getTypeColor = (type: SourceLink['type']) => {
    switch (type) {
      case 'legislation':
        return 'bg-blue-100 text-blue-700';
      case 'government':
        return 'bg-purple-100 text-purple-700';
      case 'official':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <section className="mt-10 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Official Sources & References</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        This guide references official legislation and government resources. Always verify current requirements with the relevant authorities.
      </p>
      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:bg-white transition-all"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-900 group-hover:text-primary font-medium text-sm">
                  {source.title}
                </span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getTypeColor(source.type)}`}>
                  {getTypeLabel(source.type)}
                </span>
                <span className="block text-xs text-gray-500 mt-1 truncate">
                  {source.url}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Sources;
