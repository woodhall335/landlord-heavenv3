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
      className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16"
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
      <div className="absolute inset-0 -z-10 bg-white/50 backdrop-blur-[1px]" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 min-[900px]:grid-cols-[1.05fr_0.95fr]">
          <div className="text-[#1F1B2E]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm">
              <RiShieldCheckFill className="h-5 w-5 text-[#7C5CFF]" aria-hidden="true" />
              Trusted by UK Landlords · Rated 4.8/5.0 from 247 reviews
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Legal Documents
              <span className="block text-[#7C5CFF]">in Minutes, Not Days</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#2b253d] sm:text-xl">
              Generate compliant eviction notices, court forms, and tenancy agreements —
              <span className="font-semibold"> save 80%+ vs solicitor</span>
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center rounded-xl bg-[#7C5CFF] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#6b4dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2"
              >
                Generate Your Documents →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#7C5CFF] bg-white/85 px-6 py-[10px] text-base font-semibold text-[#7C5CFF] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2"
              >
                View Pricing →
              </Link>
            </div>

            <ul className="mt-7 grid max-w-2xl gap-3 text-base font-medium sm:grid-cols-2 sm:text-lg">
              {FEATURES.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2">
                  <RiCheckLine className="h-5 w-5 flex-none text-[#7C5CFF]" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 inline-flex items-center rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
              42 landlords used this today
            </p>
          </div>

          <div className="flex justify-center min-[900px]:justify-end">
            <Image
              src="/images/mascots/landlord-heaven-owl-tenancy-tools.png"
              alt="Landlord Heaven owl mascot holding a pen and shield"
              width={560}
              height={560}
              priority
              sizes="(max-width: 899px) 85vw, (max-width: 1280px) 42vw, 560px"
              className="h-auto w-full max-w-[440px] min-[900px]:max-w-[560px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
