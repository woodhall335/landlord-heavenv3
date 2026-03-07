import Link from 'next/link';

const options = [
  {
    title: 'Serve a notice',
    href: '/products/notice-only',
    dataCta: 'notice-only' as const,
    bullets: ['Best if you need a valid Section 21 or Section 8 notice.', 'You want compliant drafting and service evidence.'],
  },
  {
    title: 'Full eviction pack',
    href: '/products/complete-pack',
    dataCta: 'complete-pack' as const,
    bullets: ['Best if the tenant is still in the property.', 'Includes notice, possession paperwork, and next-step guidance.'],
  },
  {
    title: 'Recover money owed',
    href: '/products/money-claim',
    dataCta: 'money-claim' as const,
    bullets: ['Best if you are focused on arrears or damage recovery.', 'Ideal when the tenant has left but owes rent.'],
  },
];

export function NeedHelpChoosing({ location = 'above-fold' }: { location?: 'above-fold' | 'mid' | 'bottom' }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Need help choosing your next step?</h2>
      <p className="text-gray-600 mb-6">Pick the route that matches your situation now.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {options.map((option) => (
          <div key={option.title} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">{option.title}</h3>
            <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc pl-5">
              {option.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <Link
              href={option.href}
              className="text-primary font-medium hover:underline"
              data-cta={option.dataCta}
              data-cta-location={location}
            >
              Choose this option →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
