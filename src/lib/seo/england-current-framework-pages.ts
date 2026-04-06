import type { FAQItem } from '@/components/seo/FAQSection';
import { isValidElement, type ReactNode } from 'react';

export interface CurrentFrameworkLink {
  href: string;
  title: string;
  description: string;
  icon?: 'document' | 'calculator' | 'legal' | 'home';
  type?: 'product' | 'tool' | 'guide' | 'page';
}

export interface CurrentFrameworkSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface CurrentFrameworkPageConfig {
  slug:
    | 'form-3-section-8'
    | 'section-8-notice'
    | 'renters-rights-act-eviction-rules'
    | 'eviction-notice-england'
    | 'how-to-evict-a-tenant-england'
    | 'eviction-process-england'
    | 'eviction-notice-template';
  title: string;
  description: string;
  keywords: string[];
  heroTitle: string;
  heroSubtitle: string;
  heroBullets: string[];
  pageType: 'guide' | 'notice' | 'court';
  currentFrameworkNote: string;
  introduction: string[];
  sections: CurrentFrameworkSection[];
  faqTitle: string;
  faqs: FAQItem[];
  relatedLinks: CurrentFrameworkLink[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

const reviewedDate = '5 April 2026';

function buildCurrentFrameworkNote(summary: string) {
  return `England update reviewed ${reviewedDate}. We are aligned with the Renters' Rights Act. ${summary}`;
}

export const CURRENT_ENGLAND_FRAMEWORK_PAGES: Record<
  CurrentFrameworkPageConfig['slug'],
  CurrentFrameworkPageConfig
> = {
  'form-3-section-8': {
    slug: 'form-3-section-8',
    title: 'Form 3A Section 8 Notice for England | Current Guide 2026',
    description:
      'Understand the current England Form 3A Section 8 notice, how to choose the right grounds, how to prepare evidence, and how to move into the current possession route after 1 May 2026.',
    keywords: [
      'form 3a section 8',
      'form 3a notice england',
      'section 8 form 3a',
      'england possession notice',
      'renters rights act form 3a',
    ],
    heroTitle: 'Form 3A Section 8 Notice for England',
    heroSubtitle:
      'Use this page when you need the current England possession notice, clear ground selection, and a notice-stage workflow that fits the rules in force from 1 May 2026.',
    heroBullets: [
      'Focused on the current England Form 3A route.',
      'Explains grounds, evidence, timing, and service in plain English.',
      'Routes you into current notice, court, and claim support only.',
    ],
    pageType: 'notice',
    currentFrameworkNote: buildCurrentFrameworkNote(
      'For current England possession notices, you should work from Form 3A, the grounds that fit your facts, and the current court path if the tenant does not leave.'
    ),
    introduction: [
      'If you need to regain possession in England after 1 May 2026, the starting point is no longer a broad menu of older notice routes. You now need to identify the live basis for possession, confirm the facts you can prove, and use the current notice that matches that case theory. For most breach-based cases in England, that means understanding Form 3A carefully before you serve anything.',
      'This page is designed to help you do that without over-promising certainty. A notice is not just a document to fill in. It is part of a chain that starts with tenancy facts, moves through service, and can end in an N5 and N119 possession claim. If the front end is weak, the court stage is usually weaker. Calm preparation at the notice stage gives you a much better chance of running a coherent case later.',
      'You should read this guide as a practical current-law briefing, not as a shortcut around legal judgment. Grounds need to match the real evidence. Dates need to be worked out correctly. The tenancy file needs to be consistent. Where the case is high value, contested, or factually messy, you may still want legal review before service. The aim here is to help you move into the right framework and avoid preventable errors.',
    ],
    sections: [
      {
        id: 'what-form-3a-does',
        title: 'What Form 3A does in the current England framework',
        paragraphs: [
          'Form 3A is the prescribed notice used for a Section 8 possession route in England. In practical terms, it is the formal notice that tells the tenant which grounds you rely on, when the notice expires, and why you say possession should be granted. That makes it the key notice-stage document for arrears, serious breach, nuisance, and other evidence-based cases under the current framework.',
          'That function matters because the court will often read the notice as the opening statement of your case. If the grounds are unclear, if the particulars are vague, or if the dates do not align with the facts, you create avoidable friction later. You are not only preparing something to serve on the tenant. You are also preparing something that may be examined by a judge alongside your rent schedule, tenancy agreement, witness evidence, and claim forms.',
          'The safest way to think about Form 3A is as one part of a possession workflow. You identify the facts. You match them to the correct ground or grounds. You draft the notice with enough clarity to show why those grounds apply. You serve the notice properly and preserve proof of service. If the tenant remains, you then move into the court stage with the same facts and chronology, rather than trying to reconstruct the case from memory weeks later.',
        ],
        bullets: [
          'Treat Form 3A as the first court-facing document in your file.',
          'Choose grounds from provable facts rather than assumptions.',
          'Keep the notice, evidence, and later court claim consistent.',
        ],
      },
      {
        id: 'choosing-grounds',
        title: 'Choosing grounds before you start drafting',
        paragraphs: [
          'A strong Form 3A usually starts with disciplined ground selection. Landlords sometimes want to move quickly because the tenant is not paying, communication has broken down, or the property situation is becoming stressful. Speed matters, but the better question is whether you can explain the ground clearly with documents, dates, and a sensible chronology. A weakly chosen ground can cost more time than a short pause to review the file properly.',
          'Rent arrears cases often depend on precise numbers. You should know what rent was due, what was paid, when it was paid, how the tenancy records that rent, and whether any adjustments or payment plans affect the position. Conduct cases need a similar level of discipline. What happened, when did it happen, who saw it, and what documents or messages support it? If the evidence is thin, the wording in the notice cannot make the case stronger by itself.',
          'You also need to consider how the case may evolve by the time a hearing takes place. Partial payments, fresh complaints, or changes in the tenant position can all affect how a judge sees the file. That is one reason many landlords rely on more than one ground where the facts support that approach. The goal is not to throw in every possible point. It is to build a balanced route that still makes sense if the case becomes contested later.',
        ],
        bullets: [
          'Check the tenancy agreement, rent schedule, and payment records together.',
          'Write a short chronology before you choose grounds.',
          'Use only grounds that fit the facts you can explain and prove.',
        ],
      },
      {
        id: 'drafting-particulars',
        title: 'How to draft clear particulars on the notice',
        paragraphs: [
          'The particulars section is where many current England notices become too thin. Some landlords copy phrases that sound formal but do not actually tell the tenant, or the court, what happened. Clear particulars are usually better than dramatic ones. If the issue is arrears, say what the rent is, what is unpaid, and how the shortfall arose. If the issue is nuisance or breach, explain the conduct with dates, examples, and a level-headed description of its effect.',
          'Clarity helps both at service stage and later in court. The tenant can see what you say the problem is. The court can see that the notice was not drafted in a generic way with no real case behind it. You do not need to turn the notice into a witness statement, but you do need to show enough detail to make the route understandable. That means avoiding shorthand that only makes sense to you or to someone who already knows the file.',
          'When in doubt, imagine that a new reader with no background has picked up the notice and your evidence bundle on the same morning. Would that reader understand why this notice was served, what the facts are, and where to find support for them? If the answer is no, you probably need to improve the particulars before you move on. Better drafting at this stage often saves repeated explanation later.',
        ],
        bullets: [
          'Describe the problem plainly and specifically.',
          'Use dates, amounts, and examples where they genuinely help.',
          'Avoid vague labels that are not backed by evidence.',
        ],
      },
      {
        id: 'service-and-proof',
        title: 'Service, dates, and proof of service',
        paragraphs: [
          'A compliant notice can still become difficult if service is poorly handled. You should be able to say how the notice was served, when it was served, why that method was valid for the tenancy, and what proof you kept. If your system for service is informal or inconsistent, the court stage becomes more stressful because you spend time proving delivery instead of advancing the substance of the case.',
          'Before you serve, decide which method fits the tenancy and the evidence you can preserve. Then make sure the notice date, expiry date, and supporting records align. Service is not just a delivery exercise. It is a procedural step that the tenant may challenge. A calm service process with a contemporaneous record is far better than trying to reconstruct events later from memory, screenshots, or half-complete notes.',
          'You should also think about how service fits into the next stage. If the tenant does not leave, the possession claim will usually rely on the same chronology. The cleaner your service record, the easier it is to prepare an N5 and N119 claim bundle without gaps. That continuity is one of the main reasons guided notice generation can be useful. It reduces the chance that the front of the file and the court stage drift apart.',
        ],
        bullets: [
          'Lock the service method before the notice is finalised.',
          'Keep dated proof of service and a matching chronology.',
          'Check that the notice period and file records line up exactly.',
        ],
      },
      {
        id: 'moving-to-court',
        title: 'What happens after Form 3A if the tenant remains',
        paragraphs: [
          'Form 3A is usually the notice-stage step, not the end of the case. If the tenant does not leave or the dispute continues, you may need to move into a possession claim. In England, many current claims are prepared using N5 and N119. That is why your notice-stage work matters so much. The court claim should feel like the next chapter of the same file, not a new case built from scratch after the notice expires.',
          'This is also where landlords benefit from realistic expectations. Serving a current notice does not guarantee a fast outcome. Timelines depend on the facts, the notice period, the local court, whether the tenant files a defence, and how strong your paperwork is. The better you organise the notice stage, the easier it is to manage that uncertainty. You give yourself a cleaner route into claim drafting, hearing preparation, and enforcement planning if it becomes necessary.',
          'If you already know the case is likely to reach court, it can be sensible to think about the court bundle while you are still at notice stage. That does not mean over-complicating the initial notice. It means keeping your tenancy agreement, rent ledger, witness points, service proof, and communications in a structure that will still make sense when you prepare N5 and N119. Order early usually means less rework later.',
        ],
        bullets: [
          'Plan the N5 and N119 stage before the notice expires.',
          'Keep the notice file in a format you can re-use for court.',
          'Treat every date and document as part of one possession workflow.',
        ],
      },
      {
        id: 'best-next-step',
        title: 'When to use Notice Only and when to use broader support',
        paragraphs: [
          'Notice Only is usually the best next step where you already understand the route, have the tenancy facts to hand, and mainly need the notice drafted and checked through a current workflow. It is especially useful when the core question is how to convert real facts into a structured notice with the right grounds, dates, and service notes, rather than how to redesign the whole strategy from the beginning.',
          'Broader support is often the better choice where the case is already heading towards court, where the evidence is harder to organise, or where the facts are changing quickly. You may need more than a notice. You may need help keeping the claim route, supporting documents, and next-stage planning aligned. That is the point at which a full possession workflow usually becomes more valuable than a notice-only drafting step.',
          'Whichever route you choose, keep the standard the same. You should still aim for calm drafting, a precise chronology, and a file that would stand up to later scrutiny. The biggest risk in current England possession work is often not a lack of urgency. It is using urgency as a reason to skip the basic quality checks that make the route defensible.',
        ],
      },
    ],
    faqTitle: 'Form 3A Section 8 FAQs',
    faqs: [
      {
        question: 'What is Form 3A used for in England?',
        answer:
          'Form 3A is the current England possession notice used for a Section 8 route when you rely on grounds such as arrears, breach, or nuisance and need to start the notice stage properly.',
      },
      {
        question: 'Does serving Form 3A end the case by itself?',
        answer:
          'No. If the tenant does not leave or the dispute remains live, you may still need to bring a possession claim and support it with the same facts, service records, and evidence.',
      },
      {
        question: 'Why should I prepare evidence before serving the notice?',
        answer:
          'Because the notice should match the real case you can prove. Stronger evidence at the start usually means fewer contradictions and less rework if the matter reaches court.',
      },
      {
        question: 'What is the best next step once the route is clear?',
        answer:
          'If the current England notice route is settled, start with Notice Only. If you already need notice-to-court continuity, review the Complete Pack and the N5 and N119 claim guidance as well.',
      },
    ],
    relatedLinks: [
      {
        href: '/section-8-notice',
        title: 'Section 8 notice guide',
        description: 'See how grounds, evidence, and service fit together in the wider England notice route.',
        icon: 'legal',
        type: 'guide',
      },
      {
        href: '/eviction-process-england',
        title: 'Eviction process in England',
        description: 'Follow the route from notice stage into possession claim, hearing, and enforcement planning.',
        icon: 'legal',
        type: 'guide',
      },
      {
        href: '/products/notice-only',
        title: 'Start Notice Only',
        description: 'Generate the current England notice with the route, dates, and service workflow in one place.',
        icon: 'document',
        type: 'product',
      },
      {
        href: '/n5-n119-possession-claim',
        title: 'N5 and N119 possession claim guide',
        description: 'Prepare for the court stage if the tenant remains after the notice period.',
        icon: 'legal',
        type: 'guide',
      },
    ],
    primaryCta: { label: 'Start current England notice', href: '/products/notice-only' },
    secondaryCta: { label: 'See the possession claim stage', href: '/n5-n119-possession-claim' },
  },
  'section-8-notice': {
    slug: 'section-8-notice',
    title: 'Section 8 Notice for England | Grounds, Evidence, and Current Rules',
    description:
      'Learn how the current England Section 8 notice works after 1 May 2026, including grounds, evidence, service, possession timing, and what to prepare before an N5 and N119 claim.',
    keywords: [
      'section 8 notice england',
      'section 8 notice',
      'section 8 grounds',
      'renters rights act possession',
      'england eviction notice grounds',
    ],
    heroTitle: 'Section 8 Notice for England',
    heroSubtitle:
      'Use this guide when you need the live England notice route for arrears, breach, nuisance, or another evidence-based possession case under the current framework.',
    heroBullets: [
      'Explains the live England notice route without retired comparison language.',
      'Focuses on grounds, evidence, service, and possession continuity.',
      'Links only to current notice, court, and support destinations.',
    ],
    pageType: 'guide',
    currentFrameworkNote: buildCurrentFrameworkNote(
      'Current England possession work starts with the facts, the right grounds, and a notice path that still makes sense if the matter reaches court.'
    ),
    introduction: [
      'A Section 8 notice is now one of the main live notice routes landlords need to understand in England. The important question is not whether you can download a form quickly. The important question is whether the case facts support the grounds you want to rely on and whether the notice stage is being prepared in a way that will still stand up later if you need a court order.',
      'That means a current Section 8 strategy is more than a form exercise. You need to identify the real problem, whether that is rent arrears, breach, nuisance, false statements, or another recognised ground. Then you need to test the evidence, calculate dates carefully, serve the notice correctly, and keep a file that can move forward into a possession claim without major reconstruction.',
      'This page is written to help you make those decisions in a calm and practical way. It is not a substitute for legal advice on a disputed or unusual case. But it will help you understand what the current England route expects from you, what often goes wrong, and how to avoid starting the notice stage with a weak or confused case theory.',
    ],
    sections: [
      {
        id: 'how-section-8-fits',
        title: 'How Section 8 fits into the current England possession route',
        paragraphs: [
          'Section 8 is a grounds-based route. In practice, that means you are asking for possession because something has happened that the law recognises as a valid basis for the claim. The route is therefore closely tied to facts and proof. If the case is about arrears, your rent ledger matters. If the case is about behaviour, incident records and witness material matter. If the case is about breach, the tenancy terms and the chronology matter.',
          'That evidence-first character is why the current route can work well when the file is organised early. You are not waiting until court to work out what the case is. You are building the case from the beginning. A carefully prepared notice can tell the tenant where you say the problem lies, and it can give the court a clearer starting point if the matter continues. The more consistent your notice and evidence are, the easier the later stages usually become.',
          'You should also remember that current England possession work is still procedural. Even with strong facts, the route can be slowed down by poor service, inconsistent dates, or an unclear explanation of the grounds. Good practice is therefore a combination of substance and process: strong facts, accurate drafting, proper service, and a file that is ready to move into the next stage without surprise gaps.',
        ],
        bullets: [
          'Section 8 is strongest when the facts and evidence are aligned early.',
          'The notice stage should already look like the opening of a court file.',
          'Accuracy matters as much as urgency in current England cases.',
        ],
      },
      {
        id: 'common-grounds',
        title: 'Common grounds landlords need to think through carefully',
        paragraphs: [
          'Arrears grounds are often the most common reason landlords research this route, but even apparently simple arrears cases need discipline. You should know the exact tenancy rent, the due dates, the payments received, the balance at the date of service, and whether any credits or adjustments affect the ledger. Small inaccuracies can cause disproportionate difficulty later because the court may lose confidence in the wider file if the basic numbers are not dependable.',
          'Conduct grounds require a different kind of preparation. You may need incident logs, written complaints, police references, correspondence, inspection notes, or witness material. The key is to move away from general dissatisfaction and towards specific events that can be explained and supported. A notice that says the tenant has behaved badly is far less useful than one that states what happened, when it happened, and why that conduct supports the ground relied upon.',
          'Breach grounds can also look straightforward when they are not. You should check the tenancy terms carefully, confirm that the alleged breach is real and material, and consider how a judge may view proportionality and reasonableness. In other words, you are not only asking whether a ground exists in theory. You are also asking whether the way you present the case will look coherent and fair when another person reviews the file later.',
        ],
        bullets: [
          'Arrears cases depend on accurate numbers and payment history.',
          'Conduct cases need specific incidents and support, not general frustration.',
          'Breach cases should be linked directly to the tenancy terms and chronology.',
        ],
      },
      {
        id: 'notice-period-and-dates',
        title: 'Notice periods, dates, and timing discipline',
        paragraphs: [
          'Timing is one of the easiest places for a live case to become weaker than it should be. Different grounds can have different notice periods and practical implications. That means you should never assume the timing from a previous case will still be right. Instead, you should calculate the dates for the actual grounds you are serving now and record how you arrived at them so the file is transparent later.',
          'You should also think ahead to what happens after the notice expires. If the tenant stays, do you have the documents ready to move forward? Do you know what facts may change before the hearing? Have you kept the records that show the state of arrears or the pattern of conduct at key points in time? A careful timing approach is therefore not just about the notice expiry date. It is about building a case timeline you can still explain months later.',
          'That is why many landlords benefit from a structured workflow rather than a template-only approach. A good workflow helps you generate the notice, check the dates, and understand how the next stage may look if the dispute continues. The goal is to reduce avoidable timing errors and to keep you focused on what the case needs next, rather than simply getting the notice out of the door as fast as possible.',
        ],
      },
      {
        id: 'evidence-file',
        title: 'What a stronger evidence file usually contains',
        paragraphs: [
          'A stronger Section 8 file is usually boring in the best possible way. The rent ledger adds up. The tenancy agreement is easy to find. Messages are ordered by date. Incident notes are specific. Service records are preserved. There is no mystery about what the landlord says happened, or when the case moved from one stage to the next. That kind of order can make a real difference if the tenant disputes the claim or if the court asks focused questions at a hearing.',
          'For arrears cases, you should expect to need the agreement, rent schedule, payment history, and supporting communications. For breach or conduct cases, the core file may be different, but the principle is the same: gather what supports the facts you rely on and organise it so someone else can follow it. A judge should not have to guess what document proves which point. The route works best when every key allegation has a home in the evidence bundle.',
          'You do not need a perfect case to start preparing properly. But you do need honesty about where the file is strong and where it is not. If the evidence is thinner than you hoped, that may affect which grounds you use, whether you serve now, or whether you need wider support before moving ahead. A realistic assessment at this stage is far more helpful than a confident-looking notice that the documents cannot actually support later.',
        ],
      },
      {
        id: 'next-steps-after-service',
        title: 'What to do after service and before court',
        paragraphs: [
          'After service, keep tracking the case rather than assuming the notice will speak for itself. If payments are made, record them. If communications continue, preserve them. If new incidents happen, add them to the chronology. You are still building the file, and that matters because a case can look different by the time the notice period ends or a hearing date is listed.',
          'If the tenant remains, you may need to move into an N5 and N119 possession claim. That is where the discipline of the notice stage pays off. The best claim bundles usually grow naturally from the notice file. The core facts remain the same. The service record is already preserved. The evidence is already grouped sensibly. You are not inventing the case late. You are extending the case you already prepared properly.',
          'Where the case is complex, high-conflict, or likely to be defended, broader workflow support often becomes sensible before the claim is issued. The point is not to make the route feel frightening. It is to recognise that possession work is easier when the notice, the claim, and the supporting documents all tell the same story from the start.',
        ],
      },
      {
        id: 'best-action',
        title: 'Best action for current England landlords',
        paragraphs: [
          'If you already know the facts fit the current Section 8 route, Notice Only is usually the cleanest way to move from research into action. It keeps the focus on the notice, the grounds, and the service workflow. If the case already looks likely to continue into court, or if the evidence needs more structured handling, Complete Pack may be the better operational choice because it gives you more continuity across the next stages.',
          'Either way, the main lesson is consistency. Your notice should match your documents. Your documents should match your chronology. Your chronology should still make sense when you prepare the claim. Current England possession work rewards steady file quality. It is rarely improved by jumping between disconnected templates and later trying to force everything into one coherent bundle.',
          'Use this page as the strategic guide, then move into the product path that fits your level of certainty. If the route is clear, start the current notice. If the case already needs a more complete possession workflow, review the court-stage support and the N5 and N119 guidance before you leave the planning stage behind.',
        ],
      },
    ],
    faqTitle: 'Section 8 Notice FAQs',
    faqs: [
      {
        question: 'What is the main purpose of a Section 8 notice in England now?',
        answer:
          'Its purpose is to start a current grounds-based possession case by explaining the grounds relied on, the notice timing, and the facts that support the route.',
      },
      {
        question: 'Is evidence important before the notice is served?',
        answer:
          'Yes. The current route works best when the notice matches a file you can already explain and support, rather than hoping the evidence can be rebuilt later.',
      },
      {
        question: 'What happens if the tenant stays after the notice period?',
        answer:
          'You may need to bring a possession claim and prepare N5 and N119 paperwork, using the same notice-stage facts, service record, and supporting documents.',
      },
      {
        question: 'Where should I go if I want the current workflow now?',
        answer:
          'Start with Notice Only if the route is settled. If you already expect the matter to move into court, compare the Complete Pack and the possession claim guidance as well.',
      },
    ],
    relatedLinks: [
      {
        href: '/form-3-section-8',
        title: 'Form 3A guide',
        description: 'See the current England notice itself and how a stronger notice file is put together.',
        icon: 'document',
        type: 'guide',
      },
      {
        href: '/tenant-stopped-paying-rent',
        title: 'Tenant stopped paying rent',
        description: 'Work through arrears facts, letters, evidence, and the decision to move into possession.',
        icon: 'legal',
        type: 'guide',
      },
      {
        href: '/products/notice-only',
        title: 'Generate the current notice',
        description: 'Move into a current England notice workflow once the grounds and facts are clear.',
        icon: 'document',
        type: 'product',
      },
      {
        href: '/products/complete-pack',
        title: 'Get broader possession support',
        description: 'Use a fuller route if the case already needs notice-to-court continuity.',
        icon: 'legal',
        type: 'product',
      },
    ],
    primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' },
    secondaryCta: { label: 'See the full possession process', href: '/eviction-process-england' },
  },
  'renters-rights-act-eviction-rules': {
    slug: 'renters-rights-act-eviction-rules',
    title: 'Renters\' Rights Act Eviction Rules for England | Landlord Guide 2026',
    description:
      'Understand the current eviction rules for England under the Renters\' Rights Act, including notice planning, possession claims, evidence, compliance checks, and what landlords should do after 1 May 2026.',
    keywords: [
      'renters rights act eviction rules',
      'england eviction rules 2026',
      'renters rights act landlords england',
      'current possession rules england',
      'eviction rules after 1 may 2026',
    ],
    heroTitle: 'Renters\' Rights Act Eviction Rules for England',
    heroSubtitle:
      'Use this page when you need the current rulebook for England possession work after 1 May 2026 and want a clear path from notice stage into court if needed.',
    heroBullets: [
      'Explains the current England framework in direct language.',
      'Covers notice planning, court progression, and practical file quality.',
      'Keeps older route language out of the live rule summary.',
    ],
    pageType: 'guide',
    currentFrameworkNote: buildCurrentFrameworkNote(
      'Current England eviction work should now be planned around possession grounds, notice quality, evidence discipline, and the route into N5 and N119 if the case remains live.'
    ),
    introduction: [
      'Landlords searching for the current eviction rules in England usually want one thing: a reliable explanation of what the live framework expects now. That means a guide that is clear about the date change on 1 May 2026, clear about what landlords should do with live cases, and careful not to frame current England possession work around retired pathways that no longer describe the active route.',
      'The practical answer is that current England eviction work is more evidence-led and more process-led than many landlords expect. You need to start with the facts, choose the right notice path, calculate the dates properly, serve correctly, and keep the file coherent enough to become a claim bundle if the tenant does not leave. In other words, the current rules reward preparation and consistency more than rushed document chasing.',
      'That does not mean every case becomes complicated. Many cases can still be approached calmly and methodically. But it does mean that your process should be rooted in the current framework from the first step. This page is intended to give you that overview and to help you move into the right next action, whether that is notice generation, broader possession support, or court-stage planning.',
    ],
    sections: [
      {
        id: 'what-changed',
        title: 'What changed for England from 1 May 2026',
        paragraphs: [
          'From 1 May 2026, landlords in England need to treat possession work through the current statutory framework rather than through a mixture of old and new assumptions. In practical terms, that means the live decision-making starts with the real basis for possession and the current rules attached to that basis. You should not approach a live case as a form shopping exercise. You should approach it as a structured legal process with a notice stage, a possible claim stage, and a need for continuity between them.',
          'That matters because many errors happen when landlords start with a conclusion and only later try to fit the paperwork around it. The current framework works better in the opposite direction. Start with the tenancy facts, the conduct or arrears, the available documents, the service method, and the likely next step. Then use the notice and court forms that fit that route. The rules make more sense when you see them as part of one sequence instead of disconnected tasks.',
          'It is also important to normalise the date correctly. If you are discussing a current England case now, you should be speaking in the language of the present framework, not in the language of temporary countdowns. The useful question is not what landlords once used. The useful question is what current landlords should do now under the Renters\' Rights Act and the current possession process.',
        ],
      },
      {
        id: 'notice-stage-rules',
        title: 'Current notice-stage rules landlords should work through',
        paragraphs: [
          'The notice stage remains the foundation of most possession work. You need to know which route fits the facts, which grounds apply, how the notice period is calculated, and how you will prove service. A notice that is technically generated but poorly thought through can create delay later because the tenant challenges it, the court scrutinises it closely, or your own supporting documents do not line up with the story the notice tells.',
          'That is why calm notice planning matters. Before you serve, review the agreement, the chronology, the rent position, the communications, and any supporting evidence. Check that the route makes sense not just on the day of service but also if the matter proceeds. If the case is likely to move to court, ask whether the current notice file is already organised well enough to become the front end of the claim bundle. If not, fix that now while the file is still manageable.',
          'For many landlords, the most practical way to comply with the current rules is to use a guided notice workflow rather than rely on a generic template. A structured workflow helps you keep the notice, dates, and service record aligned. That does not remove the need for judgment, but it does reduce the risk that the notice stage is treated as a separate job from the rest of the case.',
        ],
        bullets: [
          'Choose the route from the facts first, not from habit.',
          'Review dates and service before the notice is final.',
          'Prepare the notice file as if it may later be read in court.',
        ],
      },
      {
        id: 'court-stage-rules',
        title: 'What current court-stage rules mean in practice',
        paragraphs: [
          'If the tenant remains after the notice stage, the case may move into a possession claim. In current England practice, that often means preparing N5 and N119 forms with supporting evidence. The court stage is easier to manage when the notice stage was already disciplined. Your chronology, service proof, agreement, arrears schedule, witness material, and supporting documents should feel like one connected file.',
          'You should also be realistic about timelines. Court progression can vary. Some cases are straightforward. Others are delayed by disputed facts, incomplete files, or local listing pressure. The current rules do not promise speed on their own. What they reward is consistency and procedural care. The cleaner the notice and evidence work, the better the chance that your court stage will move without avoidable confusion.',
          'That is one reason broader workflow support can be valuable in the right case. If you already know that the matter is likely to reach court, planning only for the first document is rarely enough. You may be better served by looking at the claim route and the filing expectations before the notice is even served. That approach often reduces duplicated work and keeps the whole case more coherent.',
        ],
      },
      {
        id: 'compliance-and-recordkeeping',
        title: 'Compliance and recordkeeping under the current framework',
        paragraphs: [
          'The current rules are not only about the headline route. They are also about the quality of the underlying file. Courts and advisers look for internal consistency. Does the tenancy agreement match the story you are telling? Does the rent schedule align with the payment records? Are communications preserved and dated? Can you explain how service happened? Small recordkeeping failures can turn into larger arguments once the case is under pressure.',
          'A good recordkeeping routine is usually simple. Keep one chronology. Keep one evidence folder structure. Label documents clearly. Update the arrears schedule whenever there is movement. Preserve service proof on the same day it is created. Store the agreement, prescribed information, and core tenancy documents together so you are not searching for them once the case becomes urgent. This is not glamorous work, but it is often what separates a manageable case from an exhausting one.',
          'Compliance also matters because landlords sometimes underestimate how much confidence a clear file creates. If a judge can see that the paperwork is orderly and that the route has been followed carefully, the case is easier to understand. If the file is chaotic, the same facts can look less reliable. The current framework therefore rewards ordinary administrative discipline just as much as it rewards correct legal route choice.',
        ],
      },
      {
        id: 'practical-landlord-playbook',
        title: 'A practical landlord playbook for live England cases',
        paragraphs: [
          'Start by asking what the actual possession problem is. Is it arrears, breach, nuisance, or something else? Gather the key documents, write a brief chronology, and check the present rent or conduct position before you touch the notice. Then choose the current route that fits those facts. This keeps you grounded in the live framework rather than in assumptions carried over from older search habits or older paperwork.',
          'Next, prepare the notice and the service plan together. Do not finalise one without the other. Make sure the particulars are clear, the dates are right, and the proof of service can be preserved in a sensible way. If the case already looks likely to continue, think about how the file would be presented in a possession claim. That simple habit often helps you avoid leaving important documents scattered across emails, downloads, and handwritten notes.',
          'Finally, decide whether your next step is a notice-only action or a broader possession workflow. If the route is settled and the facts are organised, a current notice workflow may be all you need. If the case is complicated, document-heavy, or already heading towards court, broader support is often the more sensible commercial choice. Either way, the current framework is easier to manage when you keep every stage connected.',
        ],
      },
      {
        id: 'where-to-go-next',
        title: 'Where to go next under the current rules',
        paragraphs: [
          'Use the England notice generator page if you are ready to turn the current route into a draftable notice workflow. Use the process guide if you still need to understand how notice, claim, hearing, and enforcement fit together. Use the N5 and N119 guide if you are already moving towards the court stage and need to understand the claim paperwork in more detail.',
          'If you mainly need the live notice now, Notice Only is normally the fastest route into action. If you need notice-to-court continuity, Complete Pack is usually the better fit because it helps keep the file coherent beyond the initial notice stage. The important point is that both routes should sit inside the current Renters\' Rights Act framework rather than beside it.',
          'This page is therefore the rule summary, not the end destination. Once you understand the current framework, you should move into the path that fits your case with as little guesswork as possible and with enough caution to protect the file if the matter becomes contested.',
        ],
      },
    ],
    faqTitle: 'Renters\' Rights Act Eviction Rules FAQs',
    faqs: [
      {
        question: 'What is the key takeaway for England landlords after 1 May 2026?',
        answer:
          'The key takeaway is that live possession work should now be handled through the current Renters\' Rights Act framework, with careful notice planning, evidence preparation, and court continuity where needed.',
      },
      {
        question: 'Does the current framework still require strong paperwork?',
        answer:
          'Yes. The current rules are easier to work with when the agreement, chronology, arrears records, service proof, and claim documents all remain consistent from the start.',
      },
      {
        question: 'What happens after the current notice stage if the tenant stays?',
        answer:
          'You may need to prepare a possession claim, often using N5 and N119, supported by the same facts, service records, and evidence bundle developed at notice stage.',
      },
      {
        question: 'What is the best current action if my route is already clear?',
        answer:
          'If the live notice route is already settled, move into Notice Only. If the case already looks court-bound, compare Complete Pack and the possession claim guidance as well.',
      },
    ],
    relatedLinks: [
      {
        href: '/eviction-process-england',
        title: 'Current England eviction process',
        description: 'See how the current rules turn into a step-by-step notice, claim, and enforcement workflow.',
        icon: 'legal',
        type: 'guide',
      },
      {
        href: '/eviction-notice-england',
        title: 'England eviction notice generator',
        description: 'Move from rule summary into the current notice workflow when you are ready to act.',
        icon: 'document',
        type: 'page',
      },
      {
        href: '/products/complete-pack',
        title: 'Complete Pack',
        description: 'Get broader possession support if the case already needs notice-to-court continuity.',
        icon: 'legal',
        type: 'product',
      },
      {
        href: '/n5-n119-possession-claim',
        title: 'N5 and N119 claim guide',
        description: 'Prepare for the possession claim stage under the current England framework.',
        icon: 'legal',
        type: 'guide',
      },
    ],
    primaryCta: { label: 'View current England process', href: '/eviction-process-england' },
    secondaryCta: { label: 'Start the current notice', href: '/products/notice-only' },
  },
  'eviction-notice-england': {
    slug: 'eviction-notice-england',
    title: 'England Eviction Notice Generator | Current Possession Route 2026',
    description:
      'Use the current England eviction notice generator route to prepare a compliant notice workflow, understand Form 3A, and move into N5 and N119 claim support if the case continues.',
    keywords: [
      'england eviction notice generator',
      'eviction notice england',
      'current england notice',
      'notice generator 2026',
      'renters rights act notice generator',
    ],
    heroTitle: 'England Eviction Notice Generator',
    heroSubtitle:
      'Start here when you want a current England notice workflow that reflects the rules in force from 1 May 2026 and routes you into the right next step.',
    heroBullets: [
      'Built around current England notice-stage logic.',
      'Explains what you need before you generate anything.',
      'Keeps you inside current notice, court, and claim destinations.',
    ],
    pageType: 'notice',
    currentFrameworkNote: buildCurrentFrameworkNote(
      'A current England notice generator should help you identify the live route, build the notice around real facts, and preserve the file for a later claim if the case continues.'
    ),
    introduction: [
      'Landlords often search for an England eviction notice generator because they want speed. That is understandable, but the safest current approach is not just to generate a document quickly. It is to use a workflow that helps you confirm the route, capture the facts properly, calculate dates carefully, and keep the notice and service record strong enough for later use if the matter reaches court.',
      'A generator can be valuable when it reduces procedural mistakes. It can become risky when it encourages you to treat the notice as a standalone download rather than part of a current possession file. This page is therefore focused on the generator as a workflow, not as a shortcut. You should expect it to help with route logic, notice preparation, service planning, and the next-stage handoff into a possession claim if the tenant stays.',
      'The current England framework makes that continuity especially important. From 1 May 2026 onward, the useful question is not simply how to produce a form. The useful question is how to move from a live landlord problem into a notice route that still holds together if the case becomes defended, delayed, or court-bound. That is the standard a good generator should meet.',
    ],
    sections: [
      {
        id: 'what-a-generator-should-do',
        title: 'What a current England generator should actually do',
        paragraphs: [
          'A good current generator should help you answer the practical questions that matter before service. What is the basis for possession? Which notice route fits the facts? What information needs to be captured so the notice is accurate? What service method will you use? What evidence will you need later? If the workflow cannot help you with those questions, it may still create a document, but it is not doing enough to protect the case.',
          'That is because notice quality depends on context. The same tenancy may need different routes depending on the facts. The same ground may be stronger or weaker depending on the evidence. The same document can look compliant on screen and still be difficult to defend later if the dates are wrong or the particulars are thin. A well-designed workflow should slow you down only where accuracy genuinely matters and should otherwise help you move efficiently.',
          'You should therefore judge a generator by whether it improves decision quality, not only by whether it reduces typing. The most useful tool is one that leaves you with a notice, service plan, and supporting file that still make sense when someone else reads them later. That is the point of a current workflow.',
        ],
      },
      {
        id: 'inputs-you-need',
        title: 'What you should gather before you generate the notice',
        paragraphs: [
          'Before you start, gather the tenancy agreement, the property address, the tenant details, the rent terms, the current arrears position where relevant, and any core evidence for the grounds you are considering. You should also think about service before you generate. A notice is easier to complete well when you already know how it will be served and how you will preserve proof of that service.',
          'If the case involves arrears, update the ledger first. If the case involves breach or nuisance, pull together the chronology, messages, complaints, and any supporting records. The generator works best when it is fed with organised facts instead of partial memory. That may feel slower in the first ten minutes, but it usually saves time later because the notice and the evidence file remain aligned.',
          'This is also where you should decide how certain you are about the route. If you are clear on the current notice path, moving into Notice Only may be enough. If the file is more complicated, or if you already know you are likely to need broader court continuity, you may want to review Complete Pack and the N5 and N119 guide before you treat the notice as the whole job.',
        ],
      },
      {
        id: 'how-generator-fits-court',
        title: 'How the generator fits into a later possession claim',
        paragraphs: [
          'The best current notice workflows are designed with the claim stage in mind. If the tenant does not leave, your notice-stage work should be re-usable when you prepare N5 and N119 documents. The names, dates, rent figures, service notes, and chronology should already be consistent. That makes the claim stage less about rebuilding the history and more about presenting the existing file in the format the court expects.',
          'This is one of the main advantages of using a structured current generator rather than a static template. A workflow can capture the core data once and help you carry it forward coherently. That does not replace judgment about the claim itself, but it does reduce the chance that the notice stage and the court stage tell slightly different stories because they were prepared separately at different times.',
          'If your case is already close to court, think about the generator as the front door to a wider process rather than as the whole process. The cleaner your notice inputs are now, the more useful they become later. That includes the tenancy details, the rent record, the service proof, and the explanation of the grounds. Quality in usually means quality out.',
        ],
      },
      {
        id: 'common-generator-mistakes',
        title: 'Common mistakes landlords make when using notice tools',
        paragraphs: [
          'One common mistake is trying to use the tool before the facts are settled. If the rent ledger is not updated, or if you are unsure which ground truly applies, the notice may end up looking certain while the file remains uncertain. The better approach is to do a short fact check first and then let the tool reflect the case you actually have.',
          'Another mistake is treating service as something to think about after the notice is generated. In reality, service is part of the notice workflow. The method, date, and record all matter. If you leave that thinking until later, you increase the risk that the file becomes fragmented. A current workflow should help you keep service and notice drafting together rather than apart.',
          'A final mistake is assuming that a generator removes the need for review. Even a strong workflow still depends on the quality of the information you put into it. You should still read the notice carefully, confirm the dates, and make sure the grounds and particulars match the evidence you have. Automation is helpful, but it is not a licence to switch off judgment.',
        ],
        bullets: [
          'Do not start the workflow before the facts are updated.',
          'Plan service before you finalise the notice.',
          'Read the finished notice as if it may be shown in court later.',
        ],
      },
      {
        id: 'who-should-use-which-route',
        title: 'Who should use Notice Only and who should use broader support',
        paragraphs: [
          'Notice Only is usually right for landlords who already understand the route, want the current notice generated through a structured process, and are comfortable managing the surrounding file. It gives you the most direct path from live facts into a current England notice. That is often the best fit for a relatively clear case where the main risk is procedural accuracy rather than strategic uncertainty.',
          'Broader support is often more suitable where the case is contested, the evidence needs significant organisation, or the next step is likely to be court. In those cases, the notice is only one part of the job. You may need a workflow that keeps the claim stage in view and helps you preserve continuity between the initial notice and later possession documents.',
          'Neither choice changes the core principle. The current England framework works best when you use one route consistently from the start. Once you decide whether you need a focused notice workflow or a wider possession workflow, keep the file orderly and keep your next-step planning connected to that same route.',
        ],
      },
      {
        id: 'best-next-step-generator',
        title: 'Best next step if you want to generate the notice now',
        paragraphs: [
          'If the route is clear and your documents are ready, move into Notice Only and use the workflow to prepare the current England notice properly. If you want to understand the wider sequence first, read the England process guide so you know how notice, claim, and enforcement fit together. If the tenant is likely to remain and you want the court stage in view already, open the N5 and N119 guide at the same time.',
          'The goal is not simply to leave this page with a document. The goal is to leave with a notice workflow that is accurate, current, and useful beyond the first step. That is the standard a current England generator should meet in 2026.',
          'Used carefully, the generator becomes the beginning of a better organised possession case. Used casually, it can become just another file to fix later. Choose the first approach and the current framework becomes much easier to manage.',
        ],
      },
    ],
    faqTitle: 'England Eviction Notice Generator FAQs',
    faqs: [
      {
        question: 'What should a current England notice generator help me do?',
        answer:
          'It should help you confirm the live route, prepare a notice that matches the facts, preserve service information, and keep the file usable if the case moves into a possession claim.',
      },
      {
        question: 'Do I need my evidence ready before using the generator?',
        answer:
          'You should at least have the key facts, tenancy information, and supporting documents organised enough to choose the right route and draft the notice accurately.',
      },
      {
        question: 'Can the generated notice still lead into an N5 and N119 claim later?',
        answer:
          'Yes. A good current workflow should make that later claim stage easier by keeping names, dates, grounds, and service records consistent from the start.',
      },
      {
        question: 'What if I think the case already needs broader support?',
        answer:
          'If the matter already looks court-bound or document-heavy, compare Complete Pack and the possession claim guidance before you rely on a notice-only workflow.',
      },
    ],
    relatedLinks: [
      {
        href: '/eviction-notice-template',
        title: 'England notice template hub',
        description: 'See the broader current notice-stage owner page before you commit to a workflow.',
        icon: 'document',
        type: 'page',
      },
      {
        href: '/form-3-section-8',
        title: 'Form 3A guide',
        description: 'Understand the current England notice document that often sits behind the live route.',
        icon: 'document',
        type: 'guide',
      },
      {
        href: '/products/notice-only',
        title: 'Use Notice Only',
        description: 'Generate the current England notice through the live workflow now.',
        icon: 'document',
        type: 'product',
      },
      {
        href: '/n5-n119-possession-claim',
        title: 'Prepare for N5 and N119',
        description: 'Keep the claim stage in view if you expect the tenant to stay after notice.',
        icon: 'legal',
        type: 'guide',
      },
    ],
    primaryCta: { label: 'Generate current England notice', href: '/products/notice-only' },
    secondaryCta: { label: 'See the full England process', href: '/eviction-process-england' },
  },
  'how-to-evict-a-tenant-england': {
    slug: 'how-to-evict-a-tenant-england',
    title: 'How to Evict a Tenant in England After 1 May 2026 | Landlord Guide',
    description:
      'Follow the current process for evicting a tenant in England after 1 May 2026, from route selection and notice service to N5 and N119 claims, hearings, and enforcement planning.',
    keywords: [
      'how to evict a tenant england 2026',
      'evict tenant after 1 may 2026 england',
      'how to evict a tenant england',
      'current eviction process england',
      'renters rights act eviction landlord guide',
    ],
    heroTitle: 'How to Evict a Tenant in England After 1 May 2026',
    heroSubtitle:
      'Use this page if you want the current step-by-step route for England possession work, from the first fact check through notice, court claim, and enforcement planning.',
    heroBullets: [
      'Normalised to the 1 May 2026 England framework.',
      'Explains the process in the order landlords actually need it.',
      'Moves you into current notice and claim support only.',
    ],
    pageType: 'guide',
    currentFrameworkNote: buildCurrentFrameworkNote(
      'To evict a tenant in England now, you should start with the current possession route, prepare a defensible notice, and keep the case ready for N5 and N119 if court action becomes necessary.'
    ),
    introduction: [
      'If you need to evict a tenant in England after 1 May 2026, the safest approach is to treat the task as a sequence of connected legal and practical decisions. You begin by checking the facts and identifying the live basis for possession. You then move into the correct notice route, serve it properly, track what happens next, and prepare for the court stage if the tenant stays. The process is manageable when it is handled in that order.',
      'Many landlords feel under pressure by the time they reach this page. Rent may be unpaid, communication may have broken down, or the property situation may already be affecting finances and stress levels. That pressure is real, but it should not drive the structure of the case. The current framework rewards steady preparation. If you rush the route choice or serve a notice before the file is ready, the later stages usually become slower and more expensive, not faster.',
      'This guide is here to show you what a current England process looks like in plain English. It does not guarantee that every case will be simple or quick. But it will help you understand the main stages, the documents you should prepare, and the choices you should make before moving from one stage to the next.',
    ],
    sections: [
      {
        id: 'start-with-facts',
        title: 'Step 1: Start with the tenancy facts and the real problem',
        paragraphs: [
          'Before you think about forms or product routes, identify the real possession problem. Is the tenant in arrears? Has there been repeated breach? Is the issue behaviour, false statements, or something else? Pull together the agreement, the payment history, the communications, and any incident material before you decide what to serve. Current England cases are easier when the route is chosen from facts rather than from pressure or habit.',
          'At this stage, write a short chronology for yourself. Include tenancy start, rent amount, missed payments, warnings, complaints, inspections, or key communications. A chronology helps you see whether the route you are considering genuinely matches the events. It also becomes useful later if the matter reaches court, because you will already have the backbone of the case set out in order.',
          'This first step is also where you should assess complexity. If the file is already messy, the facts are changing, or you expect an argument, broader support may be worth considering from the start. If the route is clear and the paperwork is straightforward, a focused notice workflow may be enough.',
        ],
      },
      {
        id: 'choose-notice-route',
        title: 'Step 2: Choose the current notice route carefully',
        paragraphs: [
          'Once the facts are clear, choose the live notice route that fits them. In many current England cases, that means a grounds-based notice supported by Form 3A and the right evidence. The key point is that the notice should reflect the case you can actually prove. If the route is based on arrears, your ledger needs to be right. If it is based on breach or conduct, your records need to support the story you are telling.',
          'A good notice route is one you can still defend later. That means the grounds are sensible, the particulars are clear, and the supporting evidence is already being gathered. Do not think of the notice as a separate document job. Think of it as the opening stage of a possession case. That mindset makes it easier to decide what level of detail belongs in the notice and what level of organisation the supporting file needs from day one.',
          'If you are certain about the route, this is often the point at which Notice Only becomes the practical next step. If you are not certain, stay in planning mode a little longer and keep the whole process in view before you serve anything.',
        ],
      },
      {
        id: 'serve-properly',
        title: 'Step 3: Serve properly and preserve proof',
        paragraphs: [
          'Service is not an administrative afterthought. It is a core procedural step. Before you serve, decide the method, confirm that the dates are correct, and think about how you will prove delivery if the tenant later disputes it. Current possession work often becomes harder because landlords assume they can work this out afterwards. In reality, service is best handled as part of the notice workflow itself.',
          'Keep a record of when the notice was finalised, how it was sent, who served it if relevant, and what proof was created at the time. Store that proof with the notice and the chronology. This makes the case much easier to explain later. It also reduces the chance that your service evidence lives in one inbox, the notice in another folder, and the chronology only in your head.',
          'If you are using a guided workflow, use it to keep the notice and service records aligned. If you are managing the file manually, be especially careful about dates and documentation. The same attention to order that helps at the notice stage will usually help at claim stage as well.',
        ],
      },
      {
        id: 'track-after-service',
        title: 'Step 4: Track the case after service instead of waiting passively',
        paragraphs: [
          'After service, keep the file live. Record any payments, preserve any tenant responses, and update the chronology if anything changes. Cases often evolve between the day of service and the day the notice period ends. A landlord who keeps those updates orderly is in a much stronger position than one who stops paying attention until the next crisis arrives.',
          'This is especially important in arrears cases, where the balance may move. You should know what the arrears position is at service, at expiry, and at any later hearing. The same principle applies to conduct cases. If new incidents happen, record them properly. Do not assume the original notice alone will do all the work for you. It is the start of the file, not the entire file.',
          'A live case file also helps you decide the right next step. Some cases settle. Some change direction. Some clearly need a claim. Ongoing recordkeeping helps you react based on evidence rather than frustration.',
        ],
      },
      {
        id: 'prepare-claim',
        title: 'Step 5: Prepare for N5 and N119 if the tenant stays',
        paragraphs: [
          'If the tenant does not leave after the notice stage, you may need to bring a possession claim. Current England claims often involve N5 and N119 paperwork. The easiest way to approach that stage is to reuse the file you have already prepared: tenancy agreement, chronology, notice, service proof, arrears schedule where relevant, and supporting evidence. If you built those materials carefully earlier, the claim stage becomes much more manageable.',
          'Do not wait until the last moment to discover whether the file hangs together. Before you issue, review the whole bundle as if someone unfamiliar with the case were about to read it. Does the notice match the claim? Do the dates line up? Can you prove service? Are the supporting documents named clearly and easy to follow? This review is often where landlords notice gaps that are much easier to fix before issue than after.',
          'If the case already looks defended or document-heavy, this is usually the point at which broader workflow support becomes highly valuable. The claim stage is easier when someone has already thought about how the notice stage, evidence, and court paperwork fit together.',
        ],
      },
      {
        id: 'hearing-and-enforcement',
        title: 'Step 6: Plan for hearing and enforcement, not just the claim issue',
        paragraphs: [
          'A possession claim is still not the end of the process. If the matter is listed for hearing, you need to present a file that is coherent and complete. If a possession order is granted and the tenant still does not leave, enforcement planning becomes the next issue. That is why current England possession work should always be seen as a chain. Each stage should make the next one easier, not harder.',
          'Planning ahead does not mean catastrophising. It means understanding that the notice, claim, hearing, and enforcement stages are connected. If you know that early, you are less likely to generate isolated documents that do not fit together. You are more likely to keep one chronology, one bundle structure, and one clear theory of the case all the way through.',
          'That level of order is valuable even if the case resolves earlier. Good case structure is rarely wasted. It either supports the next stage or helps you conclude the matter with more confidence and less rework.',
        ],
      },
    ],
    faqTitle: 'How to Evict a Tenant in England FAQs',
    faqs: [
      {
        question: 'What is the first step if I need to evict a tenant in England now?',
        answer:
          'The first step is to gather the tenancy facts, identify the real possession problem, and choose the current notice route that matches those facts before anything is served.',
      },
      {
        question: 'Why is service so important in the current process?',
        answer:
          'Because service is part of the legal route itself. Clear proof of service and matching dates make the later claim stage much easier to explain and defend.',
      },
      {
        question: 'What if the tenant stays after the notice period?',
        answer:
          'You may need to prepare a possession claim, often using N5 and N119, supported by the same notice-stage chronology, service proof, and evidence bundle.',
      },
      {
        question: 'Which current product route should I choose?',
        answer:
          'Choose Notice Only when the route is already settled. Choose broader possession support when the case is more complex or already likely to move into court.',
      },
    ],
    relatedLinks: [
      {
        href: '/eviction-process-england',
        title: 'England eviction process',
        description: 'See the whole route laid out as a current notice-to-enforcement sequence.',
        icon: 'legal',
        type: 'guide',
      },
      {
        href: '/eviction-notice-england',
        title: 'England notice generator',
        description: 'Move from planning into the current notice workflow once the route is clear.',
        icon: 'document',
        type: 'page',
      },
      {
        href: '/products/complete-pack',
        title: 'Complete Pack',
        description: 'Get broader support if the case already needs claim continuity and court readiness.',
        icon: 'legal',
        type: 'product',
      },
      {
        href: '/n5-n119-possession-claim',
        title: 'N5 and N119 guide',
        description: 'Read the next-stage court paperwork guide before you issue a possession claim.',
        icon: 'legal',
        type: 'guide',
      },
    ],
    primaryCta: { label: 'Start current England notice', href: '/products/notice-only' },
    secondaryCta: { label: 'Review Complete Pack', href: '/products/complete-pack' },
  },
  'eviction-process-england': {
    slug: 'eviction-process-england',
    title: 'Eviction Process in England | Current Possession Timeline 2026',
    description:
      'Follow the current eviction process in England after 1 May 2026, including notice planning, service, N5 and N119 possession claims, hearings, enforcement, and practical landlord timelines.',
    keywords: [
      'eviction process england',
      'updated england eviction process',
      'england possession timeline',
      'n5 n119 process england',
      'renters rights act eviction process',
    ],
    heroTitle: 'Eviction Process in England',
    heroSubtitle:
      'This is the current England step-by-step process for landlords who need to move from notice planning through possession claim and enforcement after 1 May 2026.',
    heroBullets: [
      'Explains the current sequence from notice to enforcement.',
      'Shows where Form 3A, N5, and N119 fit in practice.',
      'Helps you decide when to use Notice Only or broader support.',
    ],
    pageType: 'court',
    currentFrameworkNote: buildCurrentFrameworkNote(
      'The current England eviction process should be managed as one connected possession workflow from notice stage through claim, hearing, and enforcement.'
    ),
    introduction: [
      'The eviction process in England is easier to understand when you stop treating it as a list of unrelated tasks. It is one connected route. You identify the current basis for possession, prepare the notice, serve it correctly, track what happens during the notice period, move into a claim if required, and then plan for hearing and enforcement if the case continues. That is the practical shape of the process in 2026.',
      'What often makes the process feel harder is not the existence of several stages. It is the fact that mistakes made early can echo later. If the notice route is wrong, the claim stage is weaker. If service records are incomplete, the hearing stage is harder to explain. If the chronology is disorganised, enforcement planning becomes more stressful because the whole case file already feels fragile. This guide is designed to reduce that kind of friction.',
      'Use it as a process map. It will not decide every legal judgment for you, but it will show you where the core documents fit, what most landlords should prepare at each stage, and how to keep the route coherent from the start. That is often the biggest difference between a file that moves steadily and one that constantly needs repair.',
    ],
    sections: [
      {
        id: 'process-stage-one',
        title: 'Stage 1: Route selection and file preparation',
        paragraphs: [
          'The process starts before any notice is served. You need to understand the tenancy, the nature of the problem, the documents you already have, and the documents you may still need. Review the agreement, the payment position, the communications, and any incident evidence. Build a short chronology. Ask what current route genuinely fits those facts and whether the evidence is already strong enough to support that route.',
          'This stage is where landlords decide whether the matter is ready for a focused notice workflow or whether it needs broader support. If the route is clear and the file is well organised, moving into a notice workflow can make sense. If the facts are messy, the evidence is thin, or court action already looks likely, it may be better to plan more widely before you serve anything.',
          'Good preparation at this stage makes the later process shorter in practice because the notice, service, and claim work are all built on a more reliable foundation. The aim is to avoid discovering basic weaknesses only after time has already been lost.',
        ],
      },
      {
        id: 'process-stage-two',
        title: 'Stage 2: Notice drafting and service',
        paragraphs: [
          'Once the route is selected, you move into notice drafting. For many current England cases, that means preparing Form 3A with the correct grounds, particulars, dates, and service plan. The notice should say enough to explain the case clearly, and the file behind it should already support what the notice says. That is why the notice stage is never just about filling boxes. It is about translating the case into a document that still makes sense later.',
          'Service sits inside this same stage. Decide how the notice will be served, make sure the dates are correct, and preserve proof of service at the time. If the tenant later disputes service, your file should be able to show exactly what happened without guesswork. Landlords often underestimate how much smoother the process feels when service is documented properly from the start.',
          'This is also the point where Notice Only is often the most practical product path. If you mainly need the current notice generated and checked through a structured workflow, this is the stage where it earns its value.',
        ],
      },
      {
        id: 'process-stage-three',
        title: 'Stage 3: Notice period management',
        paragraphs: [
          'After service, there is still active work to do. Track payments, communications, and any relevant changes in conduct or circumstances. Update the chronology and supporting documents. The notice period should not be treated as dead time. It is part of the possession process and often the period when your later claim file either becomes stronger or starts to drift.',
          'For arrears cases, keep the ledger current. For conduct cases, preserve new evidence if it arises. For all cases, keep service proof and notice documents together so nothing gets separated before the next step. This kind of recordkeeping makes it much easier to decide, once the notice expires, whether the file is ready to move into a claim or whether something still needs attention.',
          'The more disciplined you are here, the more likely it is that the claim stage will feel like a continuation of the same case rather than a restart under pressure.',
        ],
      },
      {
        id: 'process-stage-four',
        title: 'Stage 4: Possession claim preparation with N5 and N119',
        paragraphs: [
          'If the tenant stays and the route remains live, the next stage may be a possession claim. Many current England claims are prepared using N5 and N119 forms. By this stage, you should already have a notice, service proof, agreement, chronology, arrears schedule or supporting evidence, and a clear explanation of why possession is being sought. The best claim bundles are usually built from material that was organised earlier rather than assembled in a last-minute rush.',
          'Before issuing, review the case as a whole. Does the claim reflect the same facts as the notice? Are the names, dates, and figures consistent? Can you locate each document easily? Is there any obvious gap that a tenant or the court may question? This final review can feel repetitive, but it is often where preventable filing problems are avoided.',
          'If you already know the matter will reach this stage, Complete Pack often becomes the more sensible support path because the workflow needs to cover more than notice generation alone.',
        ],
      },
      {
        id: 'process-stage-five',
        title: 'Stage 5: Hearing preparation and case presentation',
        paragraphs: [
          'Some possession claims proceed without major dispute, while others require more detailed preparation. If the matter is listed for hearing, the court will expect a coherent file. That means the route, the chronology, the notice, the evidence, and the claim paperwork should all point in the same direction. The stronger your preparation in earlier stages, the less likely you are to spend the hearing stage firefighting basic file issues.',
          'Hearing preparation often means reviewing what the judge is likely to need to understand quickly: what tenancy existed, what happened, what notice was served, how it was served, why possession is sought, and what documents support each point. Simple structure often matters more than volume. A smaller but clearer bundle is usually better than a larger, disorganised one.',
          'Even if you never personally present the whole case, preparing with that audience in mind improves the quality of the file. It forces you to check whether the case is understandable to someone who did not live through it.',
        ],
      },
      {
        id: 'process-stage-six',
        title: 'Stage 6: Enforcement if possession is still refused',
        paragraphs: [
          'A possession order may still not end the process if the tenant does not leave. Enforcement planning then becomes the next stage. The practical lesson is that the eviction process in England does not stop at the order. It ends only when the possession route is completed. That is one more reason to keep the whole case organised from the first notice onward.',
          'Enforcement is easier to navigate when the earlier stages were handled methodically. The chronology is clear, the documents are accessible, and the order stage flows naturally into the next step. Where the file is disorganised, even a successful order can leave the landlord dealing with avoidable delays and confusion when trying to finish the process properly.',
          'You do not need to become overwhelmed by the full chain. You simply need to respect the fact that it is a chain. Current England possession work is far easier when each stage is prepared with the next stage in mind.',
        ],
      },
    ],
    faqTitle: 'Eviction Process England FAQs',
    faqs: [
      {
        question: 'What is the first stage of the current England eviction process?',
        answer:
          'The first stage is route selection and file preparation: checking the tenancy facts, choosing the current notice route, and organising the documents that support it.',
      },
      {
        question: 'Where do Form 3A, N5, and N119 fit in the process?',
        answer:
          'Form 3A commonly sits at notice stage, while N5 and N119 commonly sit at the possession claim stage if the tenant does not leave after the notice period.',
      },
      {
        question: 'Why should I keep updating the file during the notice period?',
        answer:
          'Because payments, communications, and other facts can change. Keeping the chronology and evidence current makes the later claim much easier to prepare properly.',
      },
      {
        question: 'When should I choose broader support instead of notice-only help?',
        answer:
          'Choose broader support when the case already looks likely to move into court or when the evidence and process need more structured continuity across later stages.',
      },
    ],
    relatedLinks: [
      {
        href: '/how-to-evict-a-tenant-england',
        title: 'How to evict a tenant in England',
        description: 'See the same current route framed as a landlord action guide from the first decision onward.',
        icon: 'legal',
        type: 'guide',
      },
      {
        href: '/n5-n119-possession-claim',
        title: 'N5 and N119 possession claim guide',
        description: 'Go deeper on the claim stage once the notice period has ended.',
        icon: 'legal',
        type: 'guide',
      },
      {
        href: '/products/complete-pack',
        title: 'Start Complete Pack',
        description: 'Use a broader workflow if your case already needs notice-to-court continuity.',
        icon: 'legal',
        type: 'product',
      },
      {
        href: '/products/notice-only',
        title: 'Start Notice Only',
        description: 'Use the focused notice workflow if the route is already settled and you are at notice stage now.',
        icon: 'document',
        type: 'product',
      },
    ],
    primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' },
    secondaryCta: { label: 'Review N5 and N119 guidance', href: '/n5-n119-possession-claim' },
  },
  'eviction-notice-template': {
    slug: 'eviction-notice-template',
    title: 'Eviction Notice Template for England | Current Notice Hub 2026',
    description:
      'Use this current England eviction notice template hub to understand the live notice route, see what belongs in the notice bundle, and move into Notice Only or Complete Pack with confidence.',
    keywords: [
      'eviction notice template england',
      'legally validated eviction notice generator 2026',
      'england eviction notice template',
      'current england notice hub',
      'renters rights act notice template',
    ],
    heroTitle: 'Eviction Notice Template for England',
    heroSubtitle:
      'This is the current England notice hub for landlords who want to understand the live route, the notice bundle, and the right next action before they serve.',
    heroBullets: [
      'Acts as the broad owner page for current England notice intent.',
      'Explains the bundle, service checks, and route hierarchy.',
      'Routes into Notice Only, Complete Pack, and claim guidance only.',
    ],
    pageType: 'notice',
    currentFrameworkNote: buildCurrentFrameworkNote(
      'Current England notice work should be grounded in the live route, accurate drafting, and service planning that still supports the file if a possession claim becomes necessary.'
    ),
    introduction: [
      'This page is the broad notice owner for England. Use it when you know you need to move towards possession but still want clarity on the current route, the notice bundle, and the difference between a focused notice workflow and a broader notice-to-court workflow. In 2026, that distinction matters because the strongest current files are built around the live framework from the beginning rather than around disconnected templates.',
      'An eviction notice template is useful only if it sits inside the right process. Landlords often arrive looking for a sample, a generator, or a quick answer on what to serve. Those are sensible starting points, but the current England framework demands a little more structure. You need to know why this route fits the case, what documents support it, how you will serve it, and how the file may move into court if the tenant stays.',
      'Think of this page as the place where broad notice intent becomes a current action plan. It helps you understand what belongs in the notice-stage bundle, which supporting guides to read next, and when to choose Notice Only or Complete Pack. It is not here to send you into retired pathways or to treat possession work as a one-document problem.',
    ],
    sections: [
      {
        id: 'what-this-hub-covers',
        title: 'What this current notice hub is here to do',
        paragraphs: [
          'The purpose of this hub is to handle broad England notice intent. If you are not yet sure how the live route works, what the notice bundle includes, or what the next stage may be, this page is the right place to start. It is deliberately broader than a single form guide because many landlords need route clarity before a product path becomes sensible.',
          'That broad role matters because notice-stage mistakes often begin before drafting. A landlord may choose the wrong route, overlook a supporting document, or think about service too late. By slowing down just enough to explain the current structure, this hub helps you avoid those avoidable errors and move into action with more confidence.',
          'Once the route is clear, the hub should then help you go narrower. If you need the notice generated, move into Notice Only. If you already need claim continuity and court-stage planning, move into Complete Pack. If you want to understand the court claim forms first, move into the N5 and N119 guide. The hub exists to direct that traffic cleanly.',
        ],
      },
      {
        id: 'what-notice-bundle-means',
        title: 'What belongs in a stronger current notice bundle',
        paragraphs: [
          'A stronger notice bundle usually includes more than the notice itself. It includes the tenancy agreement, the facts supporting the route, any arrears schedule or conduct evidence, service planning, and a chronology that explains the problem clearly. You may not send every supporting document at the same moment you generate the notice, but you should still have them organised because they are what make the route defensible later.',
          'For many landlords, this is the real value of a current notice workflow. It helps you think in bundles rather than fragments. That is important because the notice often becomes the first public-facing part of a file that later goes to court. If the surrounding documents are not ready, the process may still move forward, but it often does so less smoothly and with more rework.',
          'You should therefore use this hub to ask a practical question: if the tenant did not leave and I needed to continue, would the current notice-stage file make sense to another reader? If the answer is yes, you are probably on the right track. If the answer is no, this is the point to fix the structure before service rather than after it.',
        ],
      },
      {
        id: 'service-validity',
        title: 'Service checks and validity checks that should happen early',
        paragraphs: [
          'Service and validity checks are not optional extras. They are part of the notice route itself. Before you serve, decide the service method, confirm the dates, and make sure the notice contents match the current case. Keep proof of service in a place that will still be easy to find later. Many notice-stage problems are not about the basic existence of a route. They are about details that were left ambiguous or undocumented.',
          'A current notice workflow should help you slow down at the right moments. It should prompt you to verify the facts, check the dates, and think through service. That does not mean the process becomes slow overall. It means the workflow concentrates time where errors are most expensive. That is exactly what most landlords want once they understand how the current framework operates in practice.',
          'If you are using a template or generator, the same principle still applies. Review the output. Read it as if a judge may later see it. Check the particulars. Check the dates. Check the route. A current tool is helpful only if it produces something that still makes sense when read alongside the evidence file.',
        ],
      },
      {
        id: 'notice-only-vs-complete-pack',
        title: 'Notice Only vs Complete Pack under the current framework',
        paragraphs: [
          'Notice Only is usually the right choice where you already know the live route and mainly need the notice generated and checked through a current workflow. It is the faster path from settled route choice to notice-stage action. For many landlords, that is exactly what they need: a structured way to produce the notice without losing sight of service and validity.',
          'Complete Pack is normally the better choice where the case already needs broader continuity. If you expect the matter to continue into claim drafting, or if the evidence and chronology need more structure before the next stage, broader support often gives better value. The key difference is not that one option is simple and the other complex. The difference is how much of the possession workflow you already need to manage.',
          'This hub exists to help you choose between those routes intelligently. You should not have to guess whether your case is ready for a notice-only step. By the time you leave this page, you should know whether you need a focused notice workflow, a broader possession workflow, or a court-form guide before you take the next step.',
        ],
      },
      {
        id: 'how-this-links-court',
        title: 'How this hub links to the claim stage',
        paragraphs: [
          'Notice work and court work are connected. If the tenant remains after the notice period, you may need N5 and N119 claim forms. That is why this hub links directly to the claim guide. The point is not to push every user into court. The point is to make sure that landlords who need to think ahead can do so while the notice file is still being assembled.',
          'This is especially useful where the case already looks likely to continue. Instead of treating the notice as a dead-end document, you can prepare it as the opening stage of a claim file. That often means using consistent names, dates, and document labels from the start. Small habits like that can remove a surprising amount of friction later.',
          'If the case resolves earlier, the extra structure has still helped. It is rarely a waste to keep the file well organised. It either supports the court stage or gives you a clearer record of how the matter was handled.',
        ],
      },
      {
        id: 'best-next-action-template',
        title: 'Best next action from this hub',
        paragraphs: [
          'If you want the current England notice generated now, move into Notice Only. If you are still mapping out the wider route, review the England process guide. If you already know the matter may need a claim, open the N5 and N119 guide before you issue anything. The right next action depends on how settled the route is and how complete the file already feels.',
          'The important point is that you now have a current owner page for England notice intent. That means broad notice searches can land here safely, gain route clarity, and then move into the correct live destination without detouring through retired language or outdated process assumptions.',
          'Use this hub whenever you need the current route explained first. It is designed to convert broad notice intent into a grounded, current, and defensible next step.',
        ],
      },
    ],
    faqTitle: 'Eviction Notice Template FAQs',
    faqs: [
      {
        question: 'What is this page for in the current England framework?',
        answer:
          'It is the broad owner page for England notice intent, helping landlords understand the live route, the notice bundle, and the right next action before they serve.',
      },
      {
        question: 'What should be in a stronger notice bundle?',
        answer:
          'The bundle usually includes the notice, tenancy agreement, chronology, route-supporting evidence, and service planning so the file remains coherent if the case continues.',
      },
      {
        question: 'When should I use Notice Only from this page?',
        answer:
          'Use Notice Only when the live route is already clear and you mainly need the current notice generated and checked through a structured workflow.',
      },
      {
        question: 'Why does this page link to N5 and N119 guidance?',
        answer:
          'Because a current notice file should still support the possession claim stage if the tenant remains after the notice period.',
      },
    ],
    relatedLinks: [
      {
        href: '/eviction-notice-england',
        title: 'England notice generator',
        description: 'Move from broad notice research into the current notice workflow when you are ready.',
        icon: 'document',
        type: 'page',
      },
      {
        href: '/form-3-section-8',
        title: 'Form 3A guide',
        description: 'Review the current England notice document and how it supports a stronger file.',
        icon: 'document',
        type: 'guide',
      },
      {
        href: '/products/notice-only',
        title: 'Start Notice Only',
        description: 'Generate the current England notice once the route is settled.',
        icon: 'document',
        type: 'product',
      },
      {
        href: '/products/complete-pack',
        title: 'Start Complete Pack',
        description: 'Choose broader support if you already need a notice-to-court workflow.',
        icon: 'legal',
        type: 'product',
      },
    ],
    primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' },
    secondaryCta: { label: 'Review Complete Pack', href: '/products/complete-pack' },
  },
};

export function getCurrentFrameworkPageConfig(slug: CurrentFrameworkPageConfig['slug']) {
  return CURRENT_ENGLAND_FRAMEWORK_PAGES[slug];
}

function extractWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function extractVisibleText(value: ReactNode): string[] {
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  if (value == null || typeof value === 'boolean') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractVisibleText(item));
  }

  if (isValidElement(value)) {
    const props = value.props as { children?: ReactNode };
    return extractVisibleText(props.children);
  }

  return [];
}

export function getCurrentFrameworkVisibleWordCount(config: CurrentFrameworkPageConfig): number {
  const textBlocks: string[] = [
    config.heroTitle,
    config.heroSubtitle,
    config.currentFrameworkNote,
    ...config.heroBullets,
    ...config.introduction,
    ...config.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
    config.faqTitle,
    ...config.faqs.flatMap((faq) => [faq.question, ...extractVisibleText(faq.answer)]),
    ...config.relatedLinks.flatMap((link) => [link.title, link.description]),
    config.primaryCta.label,
    config.secondaryCta.label,
  ];

  return textBlocks.reduce((total, block) => total + extractWords(block), 0);
}

export const CURRENT_FRAMEWORK_MIN_VISIBLE_WORDS = 1200;
