'use client';

import { ArrowRight, BarChart3, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface RentCheckerLandingProps {
  onStart: () => void;
}

const trustBullets = [
  'England private rented sector',
  'Built around Form 4A / Section 13',
  'Uses comparable market evidence',
  'Shows challenge risk before you serve',
];

const steps = [
  {
    title: 'Compare against the local market',
    copy: 'See where the current and proposed rent sit against live comparable listings nearby.',
    icon: MapPin,
  },
  {
    title: 'See supportability and challenge risk',
    copy: 'Understand whether the increase looks supportable, borderline, or needs stronger evidence first.',
    icon: BarChart3,
  },
  {
    title: 'Move into the right Section 13 route',
    copy: 'Start with the Standard pack, switch to Defence, or take the fuller protection route.',
    icon: ShieldCheck,
  },
];

export function RentCheckerLanding({ onStart }: RentCheckerLandingProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-[0_28px_80px_rgba(88,28,135,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.18),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.12),_transparent_38%)]" />
      <div className="relative grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_360px] lg:px-10 lg:py-12">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Sparkles className="h-4 w-4" />
            Free England rent checker
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Check if your rent is fair or ready to increase
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              Compare the current rent and proposed increase against local market evidence and see whether a Section 13 rent increase is likely to be supportable, risky, or under-evidenced.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="large" onClick={onStart} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300">
              Check rent now
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a href="/products/section-13-standard?src=rent_checker_landing" className="inline-flex">
              <Button variant="outline" size="large" className="border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700">
                Already increasing rent? Generate Section 13 pack
              </Button>
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustBullets.map((bullet) => (
              <div key={bullet} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
            <span>Estimated market range</span>
            <span className="font-semibold text-white">£950 - £1,250 pcm</span>
          </div>
          <div className="rounded-2xl bg-white px-5 py-5 text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Sample outcome</p>
            <h2 className="mt-3 text-2xl font-bold">This increase looks supportable but could be challenged</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-violet-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Potential uplift</p>
                <p className="mt-2 text-xl font-bold text-slate-950">+£200/month</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Challenge risk</p>
                <p className="mt-2 text-xl font-bold text-slate-950">Moderate</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              See the supportable range, the evidence strength, and the next paid route before you serve anything.
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-200 bg-slate-50/80 px-6 py-6 sm:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RentCheckerLanding;
