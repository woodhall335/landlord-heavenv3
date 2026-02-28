import { Container } from '@/components/ui';
import {
  section8Documents,
  type CompletePackPreviewCategory,
} from '@/lib/seo/previewManifests/completePackEnglandPreviews';

export function StaticPreviewFallback() {
  const categories: CompletePackPreviewCategory[] = ['Notices', 'Court Forms', 'AI-Generated', 'Guidance', 'Evidence'];

  return (
    <section className="py-14 md:py-16 bg-white">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">What&apos;s included in your Complete Eviction Bundle (England Only)</h2>
            <p className="mt-3 text-gray-600">Choose Section 8 or Section 21. Preview every document before you pay.</p>
          </div>
          <div className="mt-8 grid gap-3 grid-cols-2 md:grid-cols-5" aria-label="Document category counts">
            {categories.map((category) => {
              const count = section8Documents.filter((document) => document.category === category).length;
              return (
                <div key={category} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{category}</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{count}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 rounded-xl border border-gray-200 p-5 bg-white">
            <p className="text-sm text-gray-600 mb-4">Document previews load instantly once this section enters view.</p>
            <ul className="grid gap-2 md:grid-cols-2">
              {section8Documents.map((document) => (
                <li key={document.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50">
                  <span className="font-medium">{document.category}:</span> {document.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
