import Image from 'next/image';
import type { AssistedPrepService } from '@/lib/assisted-prep';

type VisualContent = {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  points: string[];
};

const visualContent: Record<AssistedPrepService | 'overview', VisualContent> = {
  overview: {
    eyebrow: 'A clearer route from the start',
    title: 'Tell us what has happened before you pay for document preparation',
    body: 'Bring the key facts to a free consultation first. We check whether the route is clear, what paperwork matters and whether assisted preparation is a good fit.',
    imageSrc: '/images/illustrations/services/assisted-prep-consultation-waterbrush-v2.webp',
    imageAlt: 'Watercolour illustration of a landlord consultation file, checklist, keys and tablet',
    points: ['Free consultation before paid work', 'Clear scope and next steps', 'Secure payment link only if we can help'],
  },
  section8: {
    eyebrow: 'Before you serve a notice',
    title: 'Keep the ground, dates and service record together',
    body: 'A Section 8 notice is stronger when the tenant details, reasons, notice dates and service evidence are checked as one file before anything is served.',
    imageSrc: '/images/illustrations/services/section8-service-evidence-waterbrush-v2.webp',
    imageAlt: 'Watercolour illustration of a Section 8 notice, calendar, delivery envelope and service checklist',
    points: ['Form 3A and ground review', 'Notice-date and tenant-detail checks', 'Service evidence prompts for your file'],
  },
  possession: {
    eyebrow: 'From notice to court forms',
    title: 'Make the notice, evidence and court forms tell one story',
    body: 'The £399 full-case service can start before notice is served, combining the Section 8 notice and service record with the N5, N119 and supporting court bundle. If you have already served notice, we review that stage first.',
    imageSrc: '/images/illustrations/services/possession-court-evidence-waterbrush-v2.webp',
    imageAlt: 'Watercolour illustration of a possession claim bundle, evidence file, court calendar and property keys',
    points: ['Notice and expiry review', 'N5 and N119 preparation support', 'Evidence and filing prompts'],
  },
  money_claim: {
    eyebrow: 'Before you make a claim',
    title: 'Turn the figures and evidence into a clearer claim file',
    body: 'We help you organise the debt, correspondence and supporting records before you decide whether to send or file a money claim.',
    imageSrc: '/images/heroes/library/hero-assisted-money-claim-v2.webp',
    imageAlt: 'Watercolour illustration of landlord claim paperwork and a payment record',
    points: ['Debt and evidence review', 'Pre-action position prompts', 'Clearer claim-file structure'],
  },
};

export function AssistedPrepVisualExplainer({
  service,
  compact = false,
}: {
  service: AssistedPrepService | 'overview';
  compact?: boolean;
}) {
  const content = visualContent[service];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#e3d7ff] bg-[linear-gradient(135deg,#fbf9ff_0%,#f4eeff_100%)] shadow-sm">
      <div className={compact ? 'grid md:grid-cols-[0.9fr_1.1fr]' : 'grid lg:grid-cols-[1fr_1.05fr]'}>
        <div className="flex flex-col justify-center p-6 md:p-8">
          <p className="public-eyebrow">{content.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#20103f] md:text-3xl">{content.title}</h2>
          <p className="mt-4 text-base leading-7 text-[#5d5672]">{content.body}</p>
          <ul className="mt-6 space-y-3 text-sm font-medium leading-6 text-[#31224f]">
            {content.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7c3aed]" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[18rem] bg-white sm:min-h-[22rem]">
          <Image
            src={content.imageSrc}
            alt={content.imageAlt}
            fill
            sizes={compact ? '(max-width: 768px) 100vw, 52vw' : '(max-width: 1024px) 100vw, 52vw'}
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
