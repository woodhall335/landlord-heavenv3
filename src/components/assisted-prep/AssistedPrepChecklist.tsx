import {
  ASSISTED_PREP_CHECKLIST_INTRO,
  getAssistedPrepConfig,
  type AssistedPrepService,
} from '@/lib/assisted-prep';

export function AssistedPrepChecklist({ service }: { service: AssistedPrepService }) {
  const config = getAssistedPrepConfig(service);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">What to have ready</h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">{ASSISTED_PREP_CHECKLIST_INTRO}</p>
      <ul className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
        {config.checklist.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-medium text-slate-800">{config.finalChecklistNote}</p>
    </section>
  );
}
