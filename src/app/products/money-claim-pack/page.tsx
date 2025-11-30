import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Money Claim Pack | Landlord Heaven",
  description:
    "Pre-filled N1 or Form 3A, arrears schedule, PAP-DEBT letters, evidence index, and filing guidance for rent arrears claims in England & Wales or Scotland.",
};

const features = [
  {
    title: "Court forms auto-completed",
    bullets: [
      "England & Wales: Form N1 with particulars of claim",
      "Scotland: Simple Procedure Form 3A with schedules",
      "Pre-action compliance wording included",
    ],
  },
  {
    title: "Evidence & arrears pack",
    bullets: [
      "Schedule of arrears with interest line",
      "Evidence index for statements, tenancy, and photos",
      "Service address and contact details formatted for court",
    ],
  },
  {
    title: "Guidance & next steps",
    bullets: [
      "How to file by post or online",
      "Court fee ranges for both jurisdictions",
      "Service checklist and cover letters",
    ],
  },
];

const steps = [
  "Answer the wizard in 10–15 minutes",
  "Upload any evidence you want indexed",
  "Pay £179.99 once — no hidden extras",
  "Download your filing-ready bundle instantly",
];

const faqs = [
  {
    question: "Is this for both England & Wales and Scotland?",
    answer:
      "Yes. We generate Form N1 with PAP-DEBT docs for England & Wales and Simple Procedure Form 3A for Scotland, with the right interest wording and filing steps for each court system.",
  },
  {
    question: "Do I need a solicitor?",
    answer:
      "No. The pack is designed so landlords can file themselves. If you prefer a solicitor, you can still use the pack to cut drafting time and costs.",
  },
  {
    question: "What if I have multiple tenants?",
    answer:
      "The wizard supports joint tenants/defendants. We capture each party and service address and mirror them on the claim forms.",
  },
  {
    question: "Can I include damages or cleaning costs?",
    answer:
      "Yes. Add damages and other charges alongside rent arrears. We itemise these in the particulars and on the schedule so the court sees the breakdown.",
  },
  {
    question: "How long do I have access?",
    answer:
      "You can re-download your documents anytime from your dashboard. Updates to your case can be regenerated without extra fees.",
  },
  {
    question: "Does this include pre-action letters?",
    answer:
      "Yes. England & Wales includes PAP-DEBT letter, info sheet, and reply forms. Scotland includes pre-action demand wording and next steps.",
  },
];

export default function MoneyClaimPackPage() {
  return (
    <div className="bg-gray-50">
      <section className="bg-linear-to-br from-amber-600 via-orange-600 to-amber-500 text-white py-16 md:py-20">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center bg-white/15 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Court-ready Money Claim Pack
              </p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Recover rent arrears fast with pre-filled court forms
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                One-time £179.99 for England & Wales (N1) or Scotland (Form 3A) with particulars, PAP-DEBT letters, arrears schedule, evidence index, and filing guide.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/wizard/flow?type=money_claim&jurisdiction=england-wales&product=money_claim_england_wales"
                  className="bg-white text-amber-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-50 transition text-center"
                >
                  Start your claim – England & Wales
                </Link>
                <Link
                  href="/wizard/flow?type=money_claim&jurisdiction=scotland&product=money_claim_scotland"
                  className="bg-white/10 border border-white/40 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition text-center"
                >
                  Start your claim – Scotland
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <span className="text-white">✓</span> Pre-action compliant
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-white">✓</span> Instant downloads
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-white">✓</span> Support for joint tenants
                </span>
              </div>
            </div>
            <div className="bg-white/10 border border-white/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="bg-white text-charcoal rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">One-time price</p>
                    <p className="text-4xl font-bold text-charcoal">£179.99</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Includes</p>
                    <p className="font-semibold">N1 / Form 3A</p>
                    <p className="text-sm text-gray-500">PAP-DEBT & schedules</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-charcoal">England & Wales</p>
                    <p>Form N1 + particulars</p>
                    <p>PAP-DEBT letter & reply forms</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-charcoal">Scotland</p>
                    <p>Simple Procedure Form 3A</p>
                    <p>Pre-action demand wording</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Includes arrears schedule, evidence index, interest calculation, and filing instructions tailored to your jurisdiction.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-white">
        <Container className="max-w-6xl">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">What's included</h2>
            <p className="text-gray-700 text-lg">
              Every document you need to issue and serve a money claim for unpaid rent, damages, or other tenancy charges.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-charcoal mb-3">{feature.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {feature.bullets.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-6 text-sm text-primary-darker">
            <p>
              Bundle contents: N1 (E&W) or Form 3A (Scotland), particulars of claim, PAP-DEBT letters and reply forms, arrears schedule, damages/charges breakdown, evidence index, service cover letter, and step-by-step filing guide.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-gray-50">
        <Container className="max-w-5xl">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={step} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <p className="text-gray-800 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-white">
        <Container className="max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-charcoal">England & Wales vs Scotland</h2>
              <p className="text-gray-700">
                We guide you to the right form and court process for your jurisdiction. Each pack includes tailored interest wording, filing routes, and service instructions.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-charcoal mb-2">England & Wales</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>County Court claim (N1)</li>
                    <li>PAP-DEBT letters + reply forms</li>
                    <li>8% statutory interest wording</li>
                    <li>Option for MCOL or paper filing</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-charcoal mb-2">Scotland</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>Sheriff Court Simple Procedure (Form 3A)</li>
                    <li>Demand letter wording and service guidance</li>
                    <li>Judicial rate interest guidance</li>
                    <li>Sheriffdom selection tips</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary-darker">Why Landlord Heaven vs solicitors?</h3>
              <p className="text-gray-800">
                Typical solicitor quotes range from £600–£1,200 for drafting and filing a straightforward money claim. Our £179.99 pack gives you the documents instantly and keeps you in control.
              </p>
              <ul className="space-y-2 text-gray-800 text-sm">
                <li>• Same-day downloads, no appointments</li>
                <li>• Guided wizard ensures compliant particulars</li>
                <li>• Regenerate documents for free if details change</li>
                <li>• Filing checklist reduces rejected claims</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  href="/wizard/flow?type=money_claim&jurisdiction=england-wales&product=money_claim_england_wales"
                  className="bg-primary text-white px-4 py-3 rounded-lg font-semibold text-center hover:bg-primary/90"
                >
                  Start England & Wales
                </Link>
                <Link
                  href="/wizard/flow?type=money_claim&jurisdiction=scotland&product=money_claim_scotland"
                  className="bg-white text-primary border border-primary px-4 py-3 rounded-lg font-semibold text-center hover:bg-primary/5"
                >
                  Start Scotland
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-gray-50">
        <Container className="max-w-4xl">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-10">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-charcoal mb-2">{faq.question}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
