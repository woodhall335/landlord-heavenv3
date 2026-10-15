'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ENGLAND_POST_2026_GROUND_CATALOG, type EnglandGroundCode } from '@/lib/england-possession/ground-catalog';
import { PRODUCTS } from '@/lib/pricing/products';

const COMMON_GROUNDS: EnglandGroundCode[] = ['1', '1A', '8', '10', '11', '12', '14'];

const STAGES = [
  { key: 'research', label: 'Checking the ground and evidence' },
  { key: 'notice', label: 'Notice prepared or served' },
  { key: 'court', label: 'Court application or hearing' },
  { key: 'order', label: 'Possession order made' },
] as const;

type StageKey = (typeof STAGES)[number]['key'];

export function Section8TimelinePlanner() {
  const [groundCode, setGroundCode] = useState<EnglandGroundCode>('8');
  const [stage, setStage] = useState<StageKey>('research');
  const ground = ENGLAND_POST_2026_GROUND_CATALOG[groundCode];

  const remainingSteps = useMemo(() => {
    const noticeStep = {
      title: 'Notice and waiting period',
      detail: `${ground.noticePeriodLabel} is the maintained notice-period label for Ground ${ground.code}. Service method and case facts still need checking.`,
    };
    const steps = [
      noticeStep,
      {
        title: 'Court application and hearing',
        detail: 'If the tenant remains, the claim must match the notice and supporting evidence. Court listing time varies by area and case complexity.',
      },
      {
        title: 'Possession order',
        detail: 'If possession is granted, the court sets the date by which the tenant should leave.',
      },
      {
        title: 'Enforcement if the tenant stays',
        detail: 'A further enforcement application may be required. Local enforcement waiting times vary.',
      },
    ];

    if (stage === 'notice') return steps.slice(0);
    if (stage === 'court') return steps.slice(1);
    if (stage === 'order') return steps.slice(2);
    return steps;
  }, [ground, stage]);

  const wizardHref = `/wizard/flow?type=eviction&product=notice_only&ground=${encodeURIComponent(groundCode)}&src=section8_timeline_planner&topic=eviction`;

  return (
    <div className="rounded-3xl border border-[#D9CBFF] bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="font-semibold text-[#2a2161]">
          Ground being considered
          <select
            value={groundCode}
            onChange={(event) => setGroundCode(event.target.value as EnglandGroundCode)}
            className="mt-2 w-full rounded-xl border border-[#CAB6FF] bg-white px-4 py-3 font-normal text-gray-800"
          >
            {COMMON_GROUNDS.map((code) => (
              <option key={code} value={code}>
                Ground {code}: {ENGLAND_POST_2026_GROUND_CATALOG[code].title}
              </option>
            ))}
          </select>
        </label>
        <label className="font-semibold text-[#2a2161]">
          Current stage
          <select
            value={stage}
            onChange={(event) => setStage(event.target.value as StageKey)}
            className="mt-2 w-full rounded-xl border border-[#CAB6FF] bg-white px-4 py-3 font-normal text-gray-800"
          >
            {STAGES.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-2xl bg-[#F8F4FF] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Your planning view</p>
        <h3 className="mt-2 text-xl font-semibold text-[#2a2161]">
          Ground {ground.code}: {ground.title}
        </h3>
        <p className="mt-2 text-sm text-gray-700">
          Maintained notice-period label: <strong>{ground.noticePeriodLabel}</strong>. This is not a deadline calculation or a prediction of the court timetable.
        </p>
        <ol className="mt-5 space-y-3">
          {remainingSteps.map((item, index) => (
            <li key={item.title} className="flex gap-3 rounded-xl bg-white p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-[#2a2161]">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/tools/section-8-notice-date-calculator" className="rounded-xl border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#FCFAFF]">
          Calculate notice dates
        </Link>
        <Link href={wizardHref} className="rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">
          Prepare Ground {ground.code} Form 3A — {PRODUCTS.notice_only.displayPrice}
        </Link>
      </div>
    </div>
  );
}
