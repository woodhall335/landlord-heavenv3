import Image from 'next/image';
import Link from 'next/link';
import { RiCheckLine } from 'react-icons/ri';

const FEATURES = [
  'Download instant UK notices & forms',
  'Covers Section 21, Section 8',
  'England, Wales & Scotland',
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#f1ebff] via-[#ece5ff] to-[#f7f4ff]"
      aria-label="Landlord Heaven legal document hero"
    >
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/herobg.png"
          alt="Purple sky background with clouds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-white/10" aria-hidden="true" />

      <div className="mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-7xl items-start px-4 pt-10 pb-6 sm:px-6 md:min-h-[calc(100svh-88px)] md:pt-12 md:pb-8 lg:px-8">
        <div className="grid w-full items-center gap-4 min-[430px]:gap-6 grid-cols-[1fr_1fr] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="text-[#1F1B2E]">
            <h1 className="mt-1 text-[1.75rem] font-bold leading-[1.04] tracking-tight min-[430px]:text-[2rem] sm:text-[2.7rem] lg:text-[5rem] lg:leading-[0.98]">
              <span className="block whitespace-nowrap">Legal Documents</span>
              <span className="mt-1 block whitespace-nowrap text-[#7C5CFF]">in Minutes, Not Days</span>
            </h1>

            <p className="mt-3 max-w-[34ch] text-[1.05rem] leading-relaxed text-[#2b253d] sm:mt-4 sm:text-xl">
              Generate compliant eviction notices, court forms, and tenancy agreements —
              <span className="font-semibold"> save 80%+ vs solicitor</span>
            </p>
          </div>

          <div className="relative min-h-[220px] min-[430px]:min-h-[270px] sm:min-h-[320px] lg:min-h-[530px]">
            <Image
              src="/images/mascots/landlord-heaven-owl-tenancy-tools.png"
              alt="Landlord Heaven owl mascot with legal documents and calculator"
              fill
              priority
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 44vw, 42vw"
              className="object-contain object-center scale-[2.2] min-[430px]:scale-[2] sm:scale-[1.6] lg:scale-[1.15]"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 md:pb-10 lg:px-8 lg:pb-12">
        <ul className="grid max-w-3xl gap-3 text-base font-medium text-[#1F1B2E] sm:grid-cols-2 sm:text-lg">
          {FEATURES.map((feature) => (
            <li key={feature} className="inline-flex items-center gap-2">
              <RiCheckLine className="h-5 w-5 flex-none text-[#7C5CFF]" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/generate"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#7C5CFF] px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#6b4dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2"
          >
            Generate Your Documents →
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-[#7C5CFF] bg-white/85 px-7 py-[10px] text-base font-semibold text-[#7C5CFF] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2"
          >
            View Pricing →
          </Link>
        </div>

        <p className="mt-5 inline-flex items-center rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-medium text-[#2b253d] shadow-sm backdrop-blur-sm">
          42 landlords used this today
        </p>
      </div>
    </section>
  );
}
