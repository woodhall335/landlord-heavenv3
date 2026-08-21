'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSection8GroundGuide } from '@/lib/seo/section8-ground-guide';
import { Container } from '@/components/ui/Container';

export function Section8GroundDecisionPath() {
  const pathname = usePathname() ?? '';
  const groundCode = pathname.match(/ground-(1a|7a|\d+)\/?$/i)?.[1]?.toLowerCase();

  if (!groundCode || groundCode === '16') {
    return null;
  }

  const guide = getSection8GroundGuide(groundCode);
  const noticeHref = `/wizard/flow?type=eviction&product=notice_only&src=section8_ground_${groundCode}_decision&ground=${groundCode}`;
  const consultationHref = `/assisted-prep/start?service=section8&product=notice_only&src=section8_ground_${groundCode}_decision`;

  return (
    <section className="border-b border-[#e8ddff] bg-[#fcfaff] py-10">
      <Container>
        <div className="rounded-[1.75rem] border border-[#dfd1ff] bg-white p-6 shadow-sm md:p-8">
          <p className="public-eyebrow">Start with the right possession route</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-[#251747] md:text-3xl">
            Before you serve a Section 8 Ground {guide.code} notice
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5d5672]">
            {guide.searchLead} A valid possession case starts with the reason, the notice and the evidence all telling the same story.
          </p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="rounded-2xl bg-[#f8f4ff] p-5">
              <p className="text-sm font-semibold text-[#6b3fd1]">1. Check the reason</p>
              <p className="mt-2 text-sm leading-6 text-[#5d5672]">Use Ground {guide.code} only where the facts match {guide.label.toLowerCase()}. Do not force the facts into the wrong ground.</p>
            </li>
            <li className="rounded-2xl bg-[#f8f4ff] p-5">
              <p className="text-sm font-semibold text-[#6b3fd1]">2. Get Form 3A right</p>
              <p className="mt-2 text-sm leading-6 text-[#5d5672]">State the ground and your reasons clearly, use the current notice period, and keep a record of exactly how you serve it.</p>
            </li>
            <li className="rounded-2xl bg-[#f8f4ff] p-5">
              <p className="text-sm font-semibold text-[#6b3fd1]">3. Prepare for a court claim</p>
              <p className="mt-2 text-sm leading-6 text-[#5d5672]">If your tenant stays, the court will need the notice, service proof and evidence that supports the reason you gave.</p>
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={noticeHref} className="rounded-xl bg-[#6d28d9] px-5 py-3 font-semibold text-white transition hover:bg-[#5b21b6]">
              Start my Section 8 notice
            </Link>
            <Link href={consultationHref} className="rounded-xl border border-[#6d28d9] px-5 py-3 font-semibold text-[#5b21b6] transition hover:bg-[#f8f4ff]">
              Book a free consultation
            </Link>
            <Link href="/section-8-grounds-explained" className="px-3 py-3 font-semibold text-[#5b21b6] underline-offset-4 hover:underline">
              Compare Section 8 grounds
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
