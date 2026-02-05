import Image from 'next/image';
import Link from 'next/link';
import { RiCheckLine, RiShieldCheckFill } from 'react-icons/ri';

const FEATURES = [
  'Download instant UK notices & forms',
  'Covers Section 21, Section 8',
  'England, Wales & Scotland',
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      aria-label="Landlord Heaven legal document hero"
    >
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/herobg.png"
          alt="Purple sky background with clouds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-white/45 backdrop-blur-[1px]" aria-hidden="true" />

      <div className="mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-7xl items-center px-4 py-8 sm:px-6 md:min-h-[calc(100svh-88px)] md:py-10 lg:px-8">
        <div className="grid w-full items-end gap-6 min-[980px]:grid-cols-[1.04fr_0.96fr] min-[980px]:gap-2">
          <div className="z-10 text-[#1F1B2E]">
            <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full border border-white/80 bg-white/90 px-4 py-2.5 text-sm font-semibold shadow-sm backdrop-blur-sm sm:px-5">
              <span className="inline-flex items-center gap-2">
                <RiShieldCheckFill className="h-5 w-5 text-[#7C5CFF]" aria-hidden="true" />
                Trusted by UK Landlords
              </span>
              <span className="text-[#FFCB45]" aria-hidden="true">★★★★★</span>
              <span className="font-medium text-[#2b253d]">Rated 4.8 / 5.0 from 247 reviews</span>
            </div>

            <h1 className="mt-5 max-w-[17ch] text-[2.2rem] font-bold leading-[1.03] tracking-tight sm:text-[3.5rem] sm:leading-[0.99] lg:text-[5.1rem] lg:leading-[0.96]">
              Legal Documents
              <span className="block text-[#7C5CFF]">in Minutes, Not Days</span>
            </h1>

            <p className="mt-4 max-w-[33ch] text-lg leading-relaxed text-[#2b253d] sm:text-xl">
              Generate compliant eviction notices, court forms, and tenancy agreements —
              <span className="font-semibold"> save 80%+ vs solicitor</span>
            </p>

            <div className="relative mt-4 min-h-[230px] sm:min-h-[290px] min-[980px]:hidden">
              <Image
                src="/images/mascots/landlord-heaven-owl-tenancy-tools.png"
                alt="Landlord Heaven owl mascot with legal documents and calculator"
                fill
                priority
                sizes="(max-width: 640px) 92vw, 72vw"
                className="object-contain object-bottom-right"
              />
            </div>

            <ul className="mt-4 grid max-w-2xl gap-3 text-base font-medium sm:grid-cols-2 sm:text-lg min-[980px]:mt-6">
              {FEATURES.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2">
                  <RiCheckLine className="h-5 w-5 flex-none text-[#7C5CFF]" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center min-[980px]:mt-7">
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

            <p className="mt-5 inline-flex items-center rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
              42 landlords used this today
            </p>
          </div>

          <div className="relative hidden min-h-[530px] min-[980px]:block">
            <Image
              src="/images/mascots/landlord-heaven-owl-tenancy-tools.png"
              alt="Landlord Heaven owl mascot with legal documents and calculator"
              fill
              priority
              sizes="48vw"
              className="object-contain object-bottom-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
