import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import {
  buildFunnelProcessSectionModel,
  type FunnelProcessRoute,
  type FunnelProcessStep,
} from '@/lib/marketing/funnelProcessSection';
import type { NoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';

type EnglandNoticePreviewProps = {
  previews: NoticeOnlyPreviewData;
};

const STEP_ORDER: Record<string, string[]> = {
  section8: [
    'section-8-eviction-notice',
    'section8-form3-notice',
    'rent-arrears-schedule',
    'service-instructions',
    'validity-checklist',
    'compliance-declaration',
  ],
  section21: [
    'section21-form6a-eviction-notice',
    'section21-form6a-notice',
    'service-instructions',
    'validity-checklist',
    'compliance-declaration',
  ],
};

const ROUTE_COPY: Record<
  string,
  {
    heading: string;
    eyebrow: string;
    intro: string;
    summary: string;
  }
> = {
  section8: {
    heading: 'Current England notice bundle preview',
    eyebrow: 'Primary live route',
    intro:
      'This preview shows the current England notice bundle a landlord reviews before serving: the notice itself, the supporting case material, service guidance, and the final validity checks that help prevent a re-serve.',
    summary:
      'Use this route when the case depends on rent arrears, breach, nuisance, or another evidence-led ground. The page leads with the current England route because that is the live path broad notice users now need to understand first.',
  },
};

function sortSteps(routeId: string, steps: FunnelProcessStep[]) {
  const order = STEP_ORDER[routeId] ?? [];
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return [...steps].sort((left, right) => {
    const leftKey = normalize(left.docKey);
    const rightKey = normalize(right.docKey);
    const leftIndex = order.findIndex((value) => leftKey.includes(value));
    const rightIndex = order.findIndex((value) => rightKey.includes(value));
    const safeLeft = leftIndex === -1 ? order.length : leftIndex;
    const safeRight = rightIndex === -1 ? order.length : rightIndex;
    return safeLeft - safeRight;
  });
}

function findEnglandRoute(previews: NoticeOnlyPreviewData, routeId: 'section8') {
  const model = buildFunnelProcessSectionModel({
    product: 'notice_only',
    noticePreviews: previews,
  });

  const englandTab = model.tabs.find((tab) => tab.id === 'england');
  return englandTab?.routes.find((route) => route.id === routeId);
}

function RoutePreview({
  route,
  routeId,
}: {
  route: FunnelProcessRoute;
  routeId: 'section8';
}) {
  const copy = ROUTE_COPY[routeId];
  const steps = sortSteps(routeId, route.steps);

  return (
    <article
      className="rounded-3xl border border-[#CAB6FF] bg-white p-6 shadow-[0_18px_50px_rgba(76,29,149,0.10)] md:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#692ed4]">{copy.eyebrow}</p>
      <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">{copy.heading}</h3>
      <div className="mt-4 space-y-4 text-gray-700">
        <p>{copy.intro}</p>
        <p>{copy.summary}</p>
      </div>

      <div className="mt-8 space-y-6">
        {steps.map((step, index) => (
          <section
            key={`${route.id}-${step.id}`}
            className="rounded-2xl border border-[#E6DBFF] bg-white p-5"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="lg:w-[38%]">
                <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#692ed4] px-3 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h4 className="mt-4 text-xl font-semibold text-[#2a2161]">{step.docTitle}</h4>
                {step.previewSrc ? (
                  <figure className="mt-4 overflow-hidden rounded-2xl border border-[#E6DBFF] bg-[#FBF8FF]">
                    <Image
                      src={step.previewSrc}
                      alt={step.previewAlt || step.docTitle}
                      width={960}
                      height={680}
                      className="h-auto w-full object-contain bg-white p-3"
                      sizes="(max-width: 1024px) 100vw, 30vw"
                    />
                  </figure>
                ) : null}
              </div>

              <div className="flex-1 space-y-4 text-gray-700">
                <div>
                  <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b5aa6]">
                    What this does
                  </h5>
                  <p className="mt-2">{step.whatItDoes}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b5aa6]">
                    Why this matters
                  </h5>
                  <p className="mt-2">{step.whyItMatters}</p>
                </div>
                {step.whenUsed ? (
                  <div>
                    <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b5aa6]">
                      When landlords use it
                    </h5>
                    <p className="mt-2">{step.whenUsed}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

export function EnglandNoticePreview({ previews }: EnglandNoticePreviewProps) {
  const section8Route = findEnglandRoute(previews, 'section8');

  if (!section8Route) {
    return null;
  }

  return (
    <section className="bg-white py-12 md:py-16" aria-labelledby="england-notice-preview-heading">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#692ed4]">
              Real England notice example
            </p>
            <h2
              id="england-notice-preview-heading"
              className="mt-4 text-3xl font-bold text-[#2a2161] md:text-4xl"
            >
              England notice bundle preview
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Review the notice-stage documents and guidance before you choose a route. The aim is
              to make the page feel like a real England notice workflow, not a product pitch with a
              decorative preview attached.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            <RoutePreview route={section8Route} routeId="section8" />
          </div>
        </div>
      </Container>
    </section>
  );
}
