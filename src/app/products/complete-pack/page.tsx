import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { RiCheckboxCircleLine, RiCloseLine, RiAlertLine } from "react-icons/ri";
import {
  Sparkles,
  ScrollText,
  ClipboardCheck,
  BarChart3,
  FileText,
  Scale,
  BookOpen,
  Target,
  FolderOpen,
  Star,
  BadgePoundSterling,
  Package,
  Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Complete Eviction Pack - Full DIY Eviction Bundle | Landlord Heaven",
  description:
    "Complete DIY eviction solution from notice to possession order. Includes all court forms (N5, N5B, N119), step-by-step guidance, evidence checklists, and timeline. £149.99 one-time payment.",
  keywords: [
    "complete eviction pack",
    "eviction bundle UK",
    "possession order forms",
    "Section 8 court forms",
    "Section 21 court forms",
    "N5 form",
    "N5B form",
    "N119 form",
    "DIY eviction",
    "landlord eviction kit",
  ],
};

export default function CompleteEvictionPackPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ask Heaven-Powered
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Ask Heaven-Powered Complete Eviction Pack</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              AI-drafted documents + Everything from Notice to Possession Order
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">£149.99</span>
            </div>
            <Link
              href="/wizard?product=complete_pack"
              className="hero-btn-primary"
            >
              Start Your Eviction Pack →
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Court-ready documents • Expert guidance • Lifetime storage
            </p>
          </div>
        </Container>
      </section>

      {/* Ask Heaven Features Section */}
      <section className="py-16 md:py-20 bg-linear-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Ask Heaven AI Features (Included!)
              </h2>
              <p className="text-xl text-gray-700 mb-2">
                Get professionally drafted documents worth £650-1,400
              </p>
              <p className="text-gray-600">
                Our AI assistant drafts critical court documents that would cost hundreds if written by a solicitor
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Witness Statement */}
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">Ask Heaven Witness Statement</h3>
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-green-100 text-green-800 font-bold text-sm px-3 py-1 rounded-full">
                    Saves £200-500
                  </span>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven analyzes your case details and drafts a professional witness statement for court proceedings. Includes:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Chronological timeline of events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Legal formatting and structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Ground-specific evidence references</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Ready for court submission</span>
                  </li>
                </ul>
              </div>

              {/* Compliance Audit */}
              <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">Compliance Audit Report</h3>
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-green-100 text-green-800 font-bold text-sm px-3 py-1 rounded-full">
                    Saves £150-400
                  </span>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven checks 8 critical compliance requirements to prevent case dismissal. Covers:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Deposit protection verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Gas safety certificate checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>EPC and How to Rent compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Fix issues BEFORE filing</span>
                  </li>
                </ul>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">Case Risk Assessment</h3>
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-green-100 text-green-800 font-bold text-sm px-3 py-1 rounded-full">
                    Saves £300-500
                  </span>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven evaluates your case strength and provides strategic recommendations:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Success probability analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Weakness identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Evidence strength rating</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Timeline risk factors</span>
                  </li>
                </ul>
              </div>
            </div>

            
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">What's Included</h2>
            <p className="text-center text-gray-600 mb-12">
              Complete DIY eviction bundle adapted to your jurisdiction and grounds
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* All Notices */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">All Notices</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Section 8 or Section 21 (E&W)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Notice to Leave (Scotland)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Notice to Quit (Northern Ireland)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Service instructions included</span>
                  </li>
                </ul>
              </div>

              {/* Court Forms */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Court Forms</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>N5</strong> - Claim for Possession
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>N5B</strong> - Accelerated Possession
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>N119</strong> - Particulars of Claim
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Scotland Tribunal forms</span>
                  </li>
                </ul>
              </div>

              {/* Step-by-Step Guidance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Expert Guidance</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Step-by-step eviction guide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Timeline expectations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Evidence checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Bailiff/sheriff guidance</span>
                  </li>
                </ul>
              </div>

              {/* Grounds Coverage */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">All Grounds</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Rent arrears (Ground 8/10)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Anti-social behaviour (Ground 14)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Breach of tenancy (Ground 12)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">All 17 grounds supported</span>
                  </li>
                </ul>
              </div>

              {/* Evidence & Organization */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Evidence Tools</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Evidence collection checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Document organization tips</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">What to collect & when</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Proof of service templates</span>
                  </li>
                </ul>
              </div>

              {/* Premium Features */}
              <div className="bg-primary-subtle rounded-lg border border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Premium Features</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Lifetime cloud storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Priority email support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Unlimited regenerations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-700">Guided case analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">How It Works</h2>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Describe Your Case</h3>
                <p className="text-gray-600">
                  Tell us about your tenancy, the issue, arrears amount, and what's happened. Our wizard guides you through
                  each step.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">We Select Forms</h3>
                <p className="text-gray-600">
                  Our system determines the correct legal route, selects applicable grounds, and identifies which court forms
                  you need.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Complete Pack Generated</h3>
                <p className="text-gray-600">
                  Your complete eviction bundle is generated with all forms filled, guidance tailored to your case, and
                  next-step timelines.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Follow Our Roadmap</h3>
                <p className="text-gray-600">
                  Use our step-by-step guide to serve notice, file with court, attend hearing, and request bailiff if needed.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/wizard?product=complete_pack"
                className="hero-btn-primary"
              >
                Start Your Complete Pack →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Eviction Timeline */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Typical Eviction Timeline
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Understand what to expect at each stage (timelines vary by jurisdiction and grounds)
            </p>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Serve Notice (Day 0)</h3>
                  <p className="text-gray-600">
                    Deliver Section 8/21 notice to tenant. Must be served correctly (by post, hand delivery, or email if
                    agreed). Notice period: 2 weeks to 2 months depending on ground.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">File with Court (After Notice Period)</h3>
                  <p className="text-gray-600">
                    Submit N5/N5B claim form to county court with fee (£325-£355). Court issues claim and sends to tenant.
                    Tenant has 14 days to respond.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Hearing (4-8 weeks later)</h3>
                  <p className="text-gray-600">
                    Attend possession hearing at county court. Bring all evidence: tenancy agreement, notice, arrears
                    statement, photos. Judge reviews case and issues possession order.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    Possession Order (Immediate or 14-42 days)
                  </h3>
                  <p className="text-gray-600">
                    Outright possession order: tenant must leave by date specified. Suspended order: tenant can stay if they
                    meet conditions (e.g., pay arrears). Wait 14 days before requesting bailiff.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Bailiff Eviction (2-6 weeks after order)</h3>
                  <p className="text-gray-600">
                    If tenant doesn't leave, apply for warrant of possession. Bailiff schedules eviction date, physically
                    removes tenant and belongings. You regain possession of property.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <RiAlertLine className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Total Timeline Estimate</h4>
                  <p className="text-gray-700">
                    <strong>England & Wales:</strong> 3-6 months total (Section 8 rent arrears: fastest; Section 21: 4-5
                    months; contested cases: 6+ months)
                    <br />
                    <strong>Scotland:</strong> 4-8 months (First-tier Tribunal process is slower)
                    <br />
                    <strong>Northern Ireland:</strong> 3-6 months (similar to England & Wales)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose Complete Pack */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Why Choose the Complete Pack?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BadgePoundSterling className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Save £1,000s vs Solicitors</h3>
                <p className="text-gray-700">
                  Eviction solicitors charge £1,500-3,000+ for the same documents. Our Complete Pack gives you everything
                  for £149.99 one-time.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">All-in-One Solution</h3>
                <p className="text-gray-700">
                  No more piecing together forms from different sources. Get notice, court forms, guidance, evidence
                  checklists, and timelines in one complete bundle.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Scale className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Court-Ready Official Forms</h3>
                <p className="text-gray-700">
                  We use genuine HMCTS official forms (N5, N5B, N119, Form 6A) auto-filled with your case details. These
                  are the same forms used by solicitors nationwide.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Grounds-Aware Guidance</h3>
                <p className="text-gray-700">
                  Your bundle adapts to your specific grounds (rent arrears, ASB, breach, etc.) with tailored evidence
                  requirements, timelines, and court strategies.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                  <Image src="/lgb.svg" alt="UK Coverage" width={48} height={48} className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">UK-Wide Coverage</h3>
                <p className="text-gray-700">
                  England & Wales and Scotland fully supported with jurisdiction-specific forms, laws, and
                  timelines. Northern Ireland coming soon.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Instant Delivery</h3>
                <p className="text-gray-700">
                  Complete your case details (15-20 minutes), review your pack, pay, and download immediately. No waiting
                  days for solicitor appointments.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison: Complete Pack vs Notice Only */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Complete Pack vs Notice Only
            </h2>
            <p className="text-center text-gray-600 mb-12">Which option is right for you?</p>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal border-b border-gray-200">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-charcoal border-b border-gray-200">
                      Notice Only<br />£29.99
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary border-b border-gray-200">
                      Complete Pack<br />£149.99
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                      Eviction Notice (Section 8/21, etc.)
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Court Forms (N5, N5B, N119)</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                      Step-by-Step Eviction Guide
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <span className="text-sm text-gray-500">Basic</span>
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <span className="text-sm font-semibold text-primary">Comprehensive</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Evidence Checklist</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Timeline Expectations</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Bailiff/Sheriff Guidance</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Cloud Storage</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <span className="text-sm text-gray-500">12 months</span>
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <span className="text-sm font-semibold text-primary">Lifetime</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Priority Support</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">Best For</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Testing the waters, simple no-fault eviction (Section 21), want just the notice first
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-primary bg-primary-subtle">
                      Committed to eviction, need court action, want complete DIY solution with guidance
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">Need the full solution to take your case to court?</p>
              <Link
                href="/wizard?product=complete_pack"
                className="hero-btn-primary"
              >
                Get Complete Eviction Pack - £149.99 →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  Do I get all the court forms I need?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  Yes. The Complete Pack includes all forms required from start to finish: eviction notice (Section 8/21/Notice
                  to Leave), possession claim forms (N5, N5B, N119 for England & Wales; First-tier Tribunal forms for
                  Scotland; Civil Bill for Northern Ireland), and evidence bundling guides. If
                  you later need bailiff forms, those are also covered.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  Are these genuine official court forms?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  Absolutely. We use official HMCTS forms (Her Majesty's Courts & Tribunals Service) for England & Wales,
                  Scottish Courts & Tribunals Service forms for Scotland, and NI Courts Service forms for Northern Ireland.
                  These are the exact same forms you'd download from government websites, but pre-filled with your case
                  details.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  How long does the eviction process take?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  It varies by jurisdiction and grounds. Typical timelines:<br />
                  <strong>England & Wales:</strong> 3-6 months (Section 8 rent arrears: 3-4 months; Section 21: 4-5 months;
                  contested cases: 6+ months)<br />
                  <strong>Scotland:</strong> 4-8 months (First-tier Tribunal process)<br />
                  <strong>Northern Ireland:</strong> 3-6 months<br />
                  Our Complete Pack includes detailed timelines for your specific case.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  What if my tenant contests the eviction?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  The Complete Pack includes guidance for contested cases. You'll get evidence checklists to strengthen your
                  case and advice on attending the possession hearing. If the case becomes very
                  complex (e.g., tenant has legal representation), you may want to consult a solicitor, but our pack gives you
                  the foundation to represent yourself effectively.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  Can I use this if I've already served a notice?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  Yes! If you've already served your Section 8/21 notice (or Notice to Leave, etc.) and now need the court
                  forms, the Complete Pack is perfect. Just tell our wizard you've already served notice, provide the notice
                  date and type, and we'll generate the court claim forms and guidance for the next steps.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  What grounds for eviction do you support?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  All of them. We support all 17 grounds under the Housing Act 1988 (England & Wales), all 18 grounds for
                  eviction under the Private Housing (Tenancies) (Scotland) Act 2016, and all statutory grounds for Northern
                  Ireland. Common grounds include:<br />
                  • Ground 8/10: Rent arrears<br />
                  • Ground 14: Anti-social behaviour<br />
                  • Ground 12: Breach of tenancy<br />
                  • Section 21: No-fault eviction (E&W)<br />
                  Our wizard will ask about your situation and select the strongest applicable grounds.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  Is this cheaper than using a solicitor?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  Yes, significantly. Eviction solicitors typically charge £1,500-3,000+ for preparing notices, court forms,
                  and representing you at hearings. The Complete Pack gives you all the documents and guidance for £149.99
                  one-time. You save £1,300-2,800+ by doing it yourself with our step-by-step guidance.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  What if I make a mistake on the forms?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  Our system validates all your inputs to minimise errors (e.g., dates, arrears calculations, notice periods).
                  You can preview all documents before paying. If you spot an error after purchase, you get unlimited
                  regenerations - just update your case details and regenerate the pack at no extra cost.
                </div>
              </details>

              <details className="bg-[#F7EFFF] rounded-lg border border-gray-200">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:text-primary">
                  Do you provide legal advice?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  No. Landlord Heaven is a document generation service, not a law firm. We provide legally compliant forms and
                  plain-English guidance on the eviction process, but we do not provide legal advice tailored to your specific
                  circumstances. If you have complex legal questions, consult a solicitor.
                </div>
              </details>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-linear-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Start Your Eviction?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Get your Complete Eviction Pack now and take control of your property with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wizard?product=complete_pack"
                className="hero-btn-primary"
              >
                Get Complete Pack - £149.99 →
              </Link>
              <Link
                href="/products/notice-only"
                className="hero-btn-secondary"
              >
                Or Just Get Notice - £29.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Instant download • Court-ready documents • Lifetime storage • Priority support
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
