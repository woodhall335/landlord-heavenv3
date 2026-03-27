/**
 * HomeContent - Client Component
 *
 * Contains all the interactive homepage content.
 * Extracted from page.tsx to allow server component with metadata export.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui";
import { Hero, TrustBar } from "@/components/landing";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { HowItWorksThreeStep } from "@/components/marketing/HowItWorksThreeStep";
import {
  RiFileTextLine,
  RiMoneyPoundCircleLine,
  RiCheckLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiGlobalLine,
  RiFlashlightLine,
  RiSendPlaneFill,
  RiAddLine,
  RiMicLine,
  RiMapPin2Fill,
  RiHome6Line,
} from "react-icons/ri";

const SEO_SRC = "seo_homepage";
const evictionWizardHref = `/wizard?product=notice_only&topic=eviction&src=${SEO_SRC}`;

const primaryPaths = [
  {
    label: "Start Eviction",
    href: evictionWizardHref,
    icon: RiHome6Line,
  },
  {
    label: "Recover Unpaid Rent",
    href: `/wizard?product=money_claim&topic=debt&src=${SEO_SRC}`,
    icon: RiMoneyPoundCircleLine,
  },
  {
    label: "Create Tenancy Agreement",
    href: `/wizard?product=ast_standard&topic=tenancy&src=${SEO_SRC}`,
    icon: RiFileTextLine,
  },
];

export default function HomeContent() {
  const router = useRouter();
  const [askQuestion, setAskQuestion] = useState("");
  const [isLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!askQuestion.trim()) return;

    // Navigate to Ask Heaven page with the question as a query parameter
    router.push(`/ask-heaven?q=${encodeURIComponent(askQuestion)}`);
  };

  return (
    <div className="bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <Hero />

      <section className="bg-white border-b border-gray-100">
        <Container>
          <nav className="flex flex-wrap items-center gap-3 py-4 text-sm" aria-label="Homepage quick links">
            <Link href="#evict-tenant" className="font-medium text-primary hover:underline">How to evict a tenant</Link>
            <Link href="#section-21-vs-section-8" className="font-medium text-primary hover:underline">Section 21 vs Section 8</Link>
            <Link href="#recover-rent-arrears" className="font-medium text-primary hover:underline">Recover rent arrears</Link>
            <Link href="#landlord-eviction-help" className="font-medium text-primary hover:underline">Section 21 and Section 8 help</Link>
          </nav>
        </Container>
      </section>

      {/* LEGAL DECISION GATEWAY (adds 3-lane routing without removing existing hero visuals) */}
      <section id="evict-tenant" className="py-10 bg-[#f7f7fb]">
        <Container>
          <div className="rounded-[2rem] border border-[#ddddea] bg-[#f8f8fd] p-6 md:p-10 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Landlord action gateway
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-[#16163f]">
              What do you need to do right now?
            </h2>
            <p className="mt-4 max-w-4xl text-1xl leading-relaxed text-[#3b3b4f]">
              Whether you need to evict a tenant, serve a Section 21 or Section 8 notice, or recover rent arrears with a money claim, choose the fastest route below.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Northern Ireland properties currently support tenancy agreements only. Eviction notices and money claim packs are not currently live for NI.
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {primaryPaths.map((path) => (
                <Link
                  key={path.label}
                  href={path.href}
                  className="group flex min-h-40 flex-col items-center justify-center rounded-3xl border border-[#e2e2f0] bg-white px-6 py-8 text-center shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#cfcff0] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                >
                  <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#a987ff] to-[#6a2dd8] text-white shadow-md">
                    <path.icon className="h-8 w-8" />
                  </span>
                  <span className="text-[1rem] font-semibold leading-tight text-[#18184d]">
                    {path.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* TRUST BAR */}
      <TrustBar />

      {/* HOW IT WORKS */}
      <section id="section-21-vs-section-8" className="py-20 md:py-24 bg-gray-50">
        <Container>
          <HowItWorksThreeStep />

          <div className="max-w-5xl mx-auto">
            <div className="mt-14 text-center">








              <Link href={evictionWizardHref} className="hero-btn-primary">
                Start your eviction notice &rarr;
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Free to start &bull; Pay only when you're ready
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ASK HEAVEN */}
      <section id="recover-rent-arrears" className="py-20 md:py-24 relative overflow-hidden">
        {/* Gradient background matching Ask Heaven page */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-cyan-50 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-200/30 via-transparent to-transparent" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Ask Heaven Branding */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Image
                src="/favicon.png"
                alt="Ask Heaven"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <span className="text-2xl font-bold text-gray-900">
                Ask Heaven
              </span>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Hi, how can I help you?
              </h2>
              <p className="text-gray-500 text-lg">
                Free UK landlord advice - no sign-up required
              </p>
            </div>

            {/* Main Chat Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden p-6 md:p-8">
              {/* Main Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isLoading && askQuestion.trim()) {
                    handleAskQuestion();
                  }
                }}
                className="mb-8"
              >
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:border-primary/30 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                    <button
                      type="button"
                      className="p-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Add attachment"
                      disabled
                    >
                      <RiAddLine className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      className="flex-1 py-4 text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none text-base"
                      placeholder="Ask about evictions, rent arrears, deposits..."
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="p-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Voice input"
                      disabled
                    >
                      <RiMicLine className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !askQuestion.trim()}
                      className="m-2 p-3 bg-primary hover:bg-primary-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RiSendPlaneFill className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Eviction notice help",

                    prompt: "How do I serve an eviction notice to my tenant?",
                  },
                  {
                    label: "Rent arrears recovery",

                    prompt: "How do I recover unpaid rent from a tenant?",
                  },
                  {
                    label: "Deposit protection rules",

                    prompt: "What are the deposit protection requirements?",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setAskQuestion(item.prompt)}
                    className="group p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-lg text-left transition-all duration-200"
                  >
                    <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {getAskHeavenPromptIcon(item.label)}
                    </span>
                    <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  Free to use
                </span>
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  No sign-up required
                </span>
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  UK law focused
                </span>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                For guidance only, not legal advice.{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms apply
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* BUILT FOR CHANGING HOUSING LAW */}
      <section id="landlord-eviction-help" className="py-20 md:py-24 bg-gray-50">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div>
                <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
                  <span className="text-sm font-semibold text-primary">
                    Section 21 and Section 8 eviction help for landlords under pressure
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Landlord eviction support when rent arrears, delay, and notice mistakes put the case at risk
                </h2>
                <p className="text-lg text-gray-600">
                  If your tenant has stopped paying rent, ignored warnings, or
                  left you unsure whether to use a Section 21 eviction or Section 8
                  eviction route, you need clear landlord help fast. Landlord
                  Heaven is built to support stressed landlords with current
                  Section 21 notice rules, Section 8 grounds for possession,
                  rent arrears evidence, and jurisdiction-specific eviction
                  documents that reflect changing housing law.
                </p>

                <ul className="mt-8 space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <RiCheckLine className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Stay aligned with current Section 21 notice requirements and Section 8 eviction grounds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <RiCheckLine className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Support landlords dealing with rent arrears, tenant breach, anti-social behaviour, and possession delays</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <RiCheckLine className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Generate Section 21 and Section 8 eviction documents with jurisdiction-specific guidance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <RiCheckLine className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Reduce expensive landlord mistakes that can delay possession claims or force a notice to be served again</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center md:justify-end">
                <Image
                  src="/images/Statutory-change.webp"
                  alt="Section 21 and Section 8 eviction support for landlords"
                  width={720}
                  height={720}
                  className="w-full max-w-[520px] h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* WHY LANDLORDS USE LANDLORD HEAVEN */}
      <WhyLandlordsUseSection />

      {/* UK COVERAGE */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-12 md:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#692ed4]/10 px-5 py-2.5 mb-5">
              <RiMapPin2Fill className="w-4 h-4 text-[#692ed4]" />
              <span className="text-sm font-semibold text-[#692ed4]">
                UK-Wide Coverage
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0f172a] mb-5">
              The Right Documents for Your Region
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Housing law differs across the UK. We automatically generate
              jurisdiction-specific documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
            <JurisdictionCard
              flag="/gb-eng.svg"
              title="England"
              regionSlug="england"
              forms={[
                "Residential Tenancy Agreement",
                "Section 21 Notice",
                "Section 8 Notice",
                "County Court Forms",
              ]}
            />
            <JurisdictionCard
              flag="/gb-wls.svg"
              title="Wales"
              regionSlug="wales"
              forms={[
                "Standard Occupation Contract",
                "Section 173 Notice",
                "Renting Homes Act Forms",
                "County Court Forms",
              ]}
            />
            <JurisdictionCard
              flag="/gb-sct.svg"
              title="Scotland"
              regionSlug="scotland"
              forms={[
                "Private Residential Tenancy",
                "Notice to Leave",
                "First-tier Tribunal Forms",
                "Simple Procedure",
              ]}
            />
            <JurisdictionCard
              flag="/gb-nir.svg"
              title="Northern Ireland"
              regionSlug="northern-ireland"
              forms={[
                "Private Tenancy Agreement",
                "Northern Ireland tenancy framework",
                "Tenancy agreements only",
                "Eviction notices planned",
              ]}
            />
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to take the next step?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose your path, answer guided questions, and generate the documents you need to act with confidence. <span className="font-semibold text-gray-800">Start in under 2 minutes.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">





              <Link href={evictionWizardHref} className="hero-btn-primary">
                Start your eviction notice &rarr;
              </Link>
            </div>

            {/* Final trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500">
              <span className="flex items-center gap-2">
                <RiFlashlightLine className="w-5 h-5 text-primary" />
                Ready-to-file output
              </span>
              <span className="flex items-center gap-2">
                <RiShieldCheckLine className="w-5 h-5 text-primary" />
                Court-ready format
              </span>
              <span className="flex items-center gap-2">
                <RiGlobalLine className="w-5 h-5 text-primary" />
                All UK jurisdictions
              </span>
            </div>

            {/* Section 8 CTA - SEO Internal Linking */}
            <div className="mt-8 pt-6 border-t border-gray-300/30">
              <p className="text-gray-600">
                Generate valid{" "}
                <Link
                  href="/eviction-notice-uk"
                  className="text-primary hover:underline font-medium"
                >
                  eviction notices
                </Link>{" "}
                for England, Wales, and Scotland. Need a Section 8 eviction
                bundle?{" "}
                <Link
                  href="/section-8-notice-template"
                  className="text-primary hover:underline font-medium"
                >
                  Bundle overview
                </Link>
                {" • "}
                <Link
                  href="/eviction-notice"
                  className="text-primary hover:underline font-medium"
                >
                  Eviction Notice Pack
                </Link>
                {" • "}
                <Link
                  href="/eviction-notice"
                  className="text-primary hover:underline font-medium"
                >
                  Paid Notice Route
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function WhyLandlordsUseSection() {
  return (
    <section className="py-20 md:py-24 bg-[#f7f7fb]">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 mb-5">
              <RiShieldCheckLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Why landlords use Landlord Heaven when the case is getting stressful
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0f172a] mb-5">
              When rent arrears rise or a notice mistake could cost you weeks, you need a clearer path
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Landlord Heaven helps UK landlords work out whether a Section 21 or Section 8 eviction
              notice is the better route, avoid invalid notice errors that delay possession, and generate
              court-ready documents without getting buried in legal jargon.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            <div className="rounded-3xl border border-[#e2e2f0] bg-white p-8 shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RiFlashlightLine className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#18184d] mb-3">
                Know whether Section 21 or Section 8 fits your case fast
              </h3>
              <p className="text-lg leading-relaxed text-[#4b4b63]">
                If a tenant has stopped paying rent, breached the tenancy, or left you unsure which eviction
                notice to serve, Landlord Heaven helps you move quickly without losing time on the wrong route.
              </p>
            </div>

            <div className="rounded-3xl border border-[#e2e2f0] bg-white p-8 shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RiShieldCheckLine className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#18184d] mb-3">
                Avoid invalid notices and expensive possession delays
              </h3>
              <p className="text-lg leading-relaxed text-[#4b4b63]">
                Follow a practical workflow built around Section 21 notice rules, Section 8 grounds,
                service steps, and the common landlord mistakes that force a notice to be served again.
              </p>
            </div>

            <div className="rounded-3xl border border-[#e2e2f0] bg-white p-8 shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RiGlobalLine className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#18184d] mb-3">
                Generate court-ready landlord documents for the right UK jurisdiction
              </h3>
              <p className="text-lg leading-relaxed text-[#4b4b63]">
                Build eviction notices, rent arrears documents, and supporting paperwork with guidance that
                reflects the rules for England, Wales, Scotland, and Northern Ireland.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href={evictionWizardHref} className="hero-btn-primary">
              Start your eviction notice &rarr;
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Start with the right eviction route before notice mistakes slow the case down
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function getAskHeavenPromptIcon(label: string) {
  switch (label) {
    case "Eviction notice help":
      return <RiFileTextLine className="h-5 w-5" />;
    case "Rent arrears recovery":
      return <RiMoneyPoundCircleLine className="h-5 w-5" />;
    case "Deposit protection rules":
      return <RiShieldCheckLine className="h-5 w-5" />;
    default:
      return <RiFlashlightLine className="h-5 w-5" />;
  }
}


function JurisdictionCard({
  flag,
  title,
  regionSlug,
  forms,
}: {
  flag: string;
  title: string;
  regionSlug: string;
  forms: string[];
}) {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col">
      <div className="w-16 h-16 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4 overflow-hidden">
        <Image
          src={flag}
          alt={title}
          width={48}
          height={48}
          className="w-12 h-12 object-contain"
        />
      </div>
      <h3 className="text-2xl font-bold text-[#0f172a] mb-5 text-center">
        {title}
      </h3>
      <ul className="text-base text-gray-700 space-y-2.5 mb-6 flex-1">
        {forms.map((form) => (
          <li
            key={form}
            className="flex items-start gap-2.5 border-b border-gray-100 pb-2.5 last:border-b-0 last:pb-0"
          >
            <RiCheckLine className="w-4 h-4 text-[#692ed4] shrink-0 mt-0.5" />
            {form}
          </li>
        ))}
      </ul>
      <Link
        href={`/wizard?jurisdiction=${regionSlug}&product=notice_only&topic=eviction&src=${SEO_SRC}`}
        className="w-full h-12 rounded-xl bg-[#692ed4] hover:bg-[#5a27b8] text-white text-lg font-semibold inline-flex items-center justify-center gap-2 transition-colors"
      >
        Choose Region
        <RiArrowRightLine className="w-5 h-5" />
      </Link>
    </div>
  );
}

