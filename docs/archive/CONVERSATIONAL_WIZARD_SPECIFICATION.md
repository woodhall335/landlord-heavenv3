# 🎯 LANDLORD HEAVEN - CONVERSATIONAL WIZARD SPECIFICATION

**Version:** 1.0  
**Date:** November 2024  
**Status:** Final Design - Ready for Implementation

---

## 📋 EXECUTIVE SUMMARY

Landlord Heaven uses a **conversational wizard with structured inputs** approach that combines:

✅ **Natural conversation flow** (feels human, friendly, guiding)  
✅ **Structured data capture** (reliable, court-ready, precise)  
✅ **Intelligent branching** (only asks relevant questions)  
✅ **Progressive disclosure** (not overwhelming)  
✅ **Visual feedback** (progress, validation, context)

---

## 🎨 CORE DESIGN PRINCIPLE

> "Plain English in → legally-structured, jurisdiction-specific documents out"

### NOT THIS (Pure Chat):

❌ "How much rent is owed?"  
❌ User types: "like three grand maybe?"  
❌ AI guesses: "£3,000?"  
❌ **RESULT: MESSY, UNRELIABLE**

### NOT THIS (Dead Form):

❌ Giant 50-question form  
❌ All questions visible at once  
❌ Overwhelming  
❌ **RESULT: HIGH ABANDONMENT**

### YES THIS (Conversational + Structured):

✅ Bot: "How much rent is currently owed?"  
✅ UI: £ [____] input box + "Not sure" toggle  
✅ Bot: "When did the tenancy start?"  
✅ UI: [Date Picker] + "Approximately" option  
✅ **RESULT: CLEAN, RELIABLE, CONVERSATIONAL**

---

## 🎨 UI LAYOUT

```
┌─────────────────────────────────────────────────────────┐
│                    LANDLORD HEAVEN                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Conversation Panel (Left 60%)                    │ │
│  │                                                    │ │
│  │  🤖 Bot: What's the main issue with your tenant?  │ │
│  │                                                    │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  [💰 Not paying rent]                        │ │ │
│  │  │  [📊 Noise / antisocial behaviour]          │ │ │
│  │  │  [🏚️ Damaging the property]                  │ │ │
│  │  │  [🚪 Won't leave after tenancy ended]       │ │ │
│  │  │  [📝 Multiple issues]                        │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                    │ │
│  │  [Progress: ████░░░░░░ 4/10 questions]           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Context Panel (Right 40%)                        │ │
│  │  ─────────────────────────────────────────────────│ │
│  │  📋 What we know so far:                          │ │
│  │                                                    │ │
│  │  ✓ Location: England & Wales                      │ │
│  │  ✓ Issue: Rent arrears                            │ │
│  │  ✓ Amount owed: £2,400                            │ │
│  │  ✓ Months overdue: 3 months                       │ │
│  │  ⏳ Tenancy start date: [collecting...]          │ │
│  │                                                    │ │
│  │  💡 Why we ask:                                   │ │
│  │  We need exact amounts and dates for              │ │
│  │  your court documents. Don't worry -              │ │
│  │  you can edit these later.                        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 INPUT TYPES & PATTERNS

### 1. MULTIPLE CHOICE (Big Buttons)

```yaml
Bot: "What's the main issue with your tenant?"

UI:
  [💰 Not paying rent]           ← Big button
  [📊 Antisocial behaviour]
  [🏚️ Damaging property]
  [🚪 Won't leave]
  [📝 Multiple issues]

Behavior:
  - Immediately advances (no "Next" button)
  - Highlights on hover
  - Disabled states for invalid options
```

**Use for:**

- Category selection
- Binary choices
- Tenancy type selection
- Yes/No/Not sure questions

---

### 2. AMOUNT ENTRY (Currency Input)

```yaml
Bot: "How much rent is currently owed?"

UI: ┌─────────────────────────────────┐
  │  £ [_2,400__]                   │  ← Currency input
  │                                 │
  │  [ ] I'm not sure of exact      │  ← Checkbox option
  │      amount (we'll estimate)    │
  └─────────────────────────────────┘

  [Continue →]

Features:
  - Auto-formats with commas (£2,400)
  - Numeric only
  - Minimum £0
  - Optional "unsure" toggle
  - Inline validation
```

**Use for:**

- Rent amounts
- Arrears totals
- Deposit amounts
- Damage costs
- Claim amounts

---

### 3. DATE ENTRY (Date Picker)

```yaml
Bot: "When did the tenancy start?"

UI:
  ┌─────────────────────────────────┐
  │  [📅 DD/MM/YYYY]                │  ← Date picker
  │                                 │
  │  Quick options:                 │
  │  [This month] [3 months ago]    │  ← Smart defaults
  │  [6 months ago] [1 year ago]    │
  │                                 │
  │  [ ] I don't know the exact     │  ← Checkbox
  │      date (approximate is OK)   │
  └─────────────────────────────────┘

  [Continue →]

Features:
  - Calendar popup
  - Quick date buttons
  - "Approximate" option
  - Past dates only (for start dates)
  - Future dates only (for end dates)
  - Validates logical date ranges
```

**Use for:**

- Tenancy start dates
- Notice service dates
- Payment due dates
- Last payment dates
- Incident dates

---

### 4. YES/NO/UNSURE (Toggle + Follow-up)

```yaml
Bot: "Is the deposit protected in a government-approved scheme?"

UI: ┌────────────────────────────────────────┐
  │  [●Yes] [○No] [○Not sure]              │  ← Radio buttons
  │                                         │
  │  💡 This is legally required for ASTs   │
  │     If "No", Section 21 may not work    │
  └────────────────────────────────────────┘

If "Yes" → Follow-up appears: ┌────────────────────────────────────────┐
  │  Which scheme?                          │
  │  [● DPS] [○ TDS] [○ MyDeposits]         │
  └────────────────────────────────────────┘

  [Continue →]

Features:
  - Clear visual states
  - Inline help text
  - Conditional follow-ups
  - Legal warnings when needed
```

**Use for:**

- Compliance questions
- Document possession
- Condition checks
- Permission questions

---

### 5. TEXT ENTRY (Minimal Use)

```yaml
Bot: "What's the tenant's full name?"

UI:
  ┌─────────────────────────────────┐
  │  First name: [John________]     │  ← Text input
  │  Last name:  [Smith_______]     │
  │                                 │
  │  [ ] Multiple tenants           │  ← Expands form
  └─────────────────────────────────┘

  [Continue →]

Features:
  - Auto-capitalization
  - Character validation
  - Required field indicators
  - Multi-tenant expansion
```

**Use for:**

- Names
- Addresses
- Property descriptions
- Unique identifiers

---

### 6. MULTIPLE SELECTION (Checkboxes)

```yaml
Bot: "Are there any other issues? (Select all that apply)"

UI:
  ┌────────────────────────────────────────┐
  │  [ ] Damage to property                │  ← Checkboxes
  │  [ ] Antisocial behaviour              │
  │  [ ] Unauthorized occupants            │
  │  [ ] Breach of tenancy terms           │
  │  [✓] None - just the rent arrears      │
  └────────────────────────────────────────┘

  [Continue →]

Features:
  - Multiple selections allowed
  - "None" option disables others
  - Each selection may trigger follow-ups
  - Visual count of selections
```

**Use for:**

- Multiple grounds selection
- Additional issues
- Document checklist
- Compliance requirements

---

### 7. FILE UPLOAD (Optional)

```yaml
Bot: "Do you have a copy of the tenancy agreement?"

UI:
  ┌────────────────────────────────────────┐
  │  [🔎 Upload file] or [Skip this step]  │
  │                                         │
  │  💡 This helps us check your rights     │
  │     but isn't required to continue      │
  │                                         │
  │  Drag & drop or click to browse         │
  │                                         │
  │  Accepted: PDF, DOC, DOCX, JPG, PNG     │
  │  Max size: 10MB                         │
  └────────────────────────────────────────┘

Features:
  - Drag & drop support
  - File type validation
  - Size limit enforcement
  - Preview after upload
  - Optional (never blocks progress)
```

**Use for:**

- Tenancy agreements
- Evidence documents
- Photos of damage
- Correspondence
- Previous notices

---

### 8. SCALE/RANGE (For Severity)

```yaml
Bot: "How severe is the antisocial behaviour?"

UI:
  ┌────────────────────────────────────────┐
  │  Minor          Moderate        Severe  │
  │  ├────────●────────────────────────────┤  ← Slider
  │                                         │
  │  Selected: Moderate                     │
  │                                         │
  │  Examples at this level:                │
  │  • Regular loud music                   │
  │  • Frequent arguments                   │
  │  • Complaint from 1-2 neighbors         │
  └────────────────────────────────────────┘

Features:
  - Visual scale
  - Context-specific examples
  - Snap to discrete values
  - Tooltip descriptions
```

**Use for:**

- Severity assessment
- Frequency ratings
- Impact evaluation
- Urgency levels

---

## 📋 COMPLETE CONVERSATION FLOW EXAMPLE (Rent Arrears)

### Step 1: Big Button Selection

```yaml
┌──────────────────────────────────────────┐
│ 🤖 What brings you here today?          │
│                                          │
│ [💰 Tenant not paying rent]             │
│ [🏠 Create tenancy agreement]           │
│ [💸 Claim money owed]                   │
└──────────────────────────────────────────┘
```

### Step 2: Location

```yaml
┌──────────────────────────────────────────┐
│ 🤖 Where is the property located?       │
│                                          │
│ [🏴󠁧󠁢󠁥󠁮󠁧󠁿 England & Wales]                   │
│ [🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland]                           │
│ [🇮🇪 Northern Ireland]                   │
└──────────────────────────────────────────┘
```

### Step 3: Amount

```yaml
┌──────────────────────────────────────────┐
│ 🤖 How much rent is owed in total?      │
│                                          │
│ £ [2,400_______]                         │
│                                          │
│ [ ] Not sure of exact amount            │
│                                          │
│ 💡 Enter the total unpaid rent          │
│                                          │
│ [Continue →]                             │
└──────────────────────────────────────────┘
```

### Step 4: Duration

```yaml
┌──────────────────────────────────────────┐
│ 🤖 How many months behind are they?     │
│                                          │
│ [1 month] [2 months] [3 months] [4+]    │
│                                          │
│ Or enter exactly: [3] months            │
│                                          │
│ 💡 3+ months = stronger legal grounds   │
└──────────────────────────────────────────┘
```

### Step 5: HMO Detection & Upsell 🆕

```yaml
Bot detects: 3+ unrelated tenants

┌──────────────────────────────────────────┐
│ 🤖 This is an HMO property!              │
│                                          │
│ Managing HMOs? HMO Pro gives you:        │
│                                          │
│ ✅ Council-specific licensing            │
│ ✅ Unlimited tenant updates (no fees!)   │
│ ✅ Automated compliance reminders        │
│ ✅ Portfolio dashboard                   │
│                                          │
│ From £19.99/month                        │
│ Try free for 7 days                      │
│                                          │
│ [Start Free Trial] [Maybe Later]         │
└──────────────────────────────────────────┘
```

---

## 📊 RIGHT PANEL: "WHAT WE KNOW SO FAR"

Always visible context panel that updates in real-time:

```yaml
┌───────────────────────────────────┐
│ 📋 Your Case Summary              │
│ ───────────────────────────────── │
│                                   │
│ ✅ Collected:                     │
│ • Location: England & Wales       │
│ • Issue: Rent arrears             │
│ • Amount: £2,400                  │
│ • Duration: 3 months              │
│ • Start date: 15/06/2023          │
│ • Type: Fixed term                │
│ • Deposit: Protected (DPS)        │
│                                   │
│ ⏳ Still needed:                  │
│ • Compliance documents status     │
│ • Other issues check              │
│                                   │
│ 💡 Progress: 80%                  │
│ ████████████░░░░                  │
│                                   │
│ [Edit answers] [Save & exit]      │
└───────────────────────────────────┘
```

**Features:**

- Real-time updates as user answers
- Green checkmarks for completed items
- Hourglass for in-progress
- Edit capability (click any item)
- Save & exit (resume later)
- Progress bar visualization

---

## 🎯 BRANCHING LOGIC RULES

### Intelligent Question Flow:

```yaml
IF primary_issue = "rent_arrears":
  → Ask: amount, duration, last_payment
  → THEN branch:
    IF duration >= 2 months:
      → Ask: deposit_protection
      → Ask: compliance_documents
      → Route: Section 8 Ground 8
    ELSE:
      → Route: Section 8 Ground 10

IF primary_issue = "antisocial":
  → Ask: severity, frequency, evidence
  → Ask: police_involved, complaints_received
  → Route: Section 8 Ground 14

IF tenancy_type = "fixed_term" AND past_end_date = true:
  → Offer: Section 21 option
  → Ask: compliance_checklist

IF deposit_protected = "no":
  → Flag: Cannot use Section 21
  → Suggest: Section 8 only
  → Warn: May need to return 3x deposit

IF tenant_count >= 3 AND shared_facilities = true:
  → Detect: HMO property
  → Show: HMO Pro upsell
  → Offer: 7-day free trial
```

---

## 🎨 MOBILE OPTIMIZATION

### Mobile Layout (< 768px):

```yaml
┌───────────────────────────┐
│  [≡] Landlord Heaven      │
│                           │
│  🤖 Question here         │
│                           │
│  [Input/Buttons]          │
│                           │
│  ───────────────────────  │
│  Progress: ████░░░ 40%    │
│  ───────────────────────  │
│                           │
│  📋 Summary (collapsible) │
│  [▼ Tap to expand]        │
│                           │
└───────────────────────────┘
```

**Mobile-Specific Features:**

- Single column layout
- Larger touch targets (min 44px)
- Collapsible context panel
- Swipe gestures for navigation
- Auto-scroll to next question
- Sticky progress bar
- Bottom-sheet inputs for dates/amounts

---

## 🔧 TECHNICAL SPECIFICATIONS

### Conversation State Machine:

```typescript
interface ConversationState {
  // Progress tracking
  step: number;
  totalSteps: number;
  progress: number; // 0-100

  // Route context
  route: "eviction" | "tenancy" | "money-claim";
  jurisdiction: "uk-england-wales" | "uk-scotland" | "uk-ni";

  // Data collection
  collectedFacts: Record<string, any>;
  missingFacts: string[];
  validationErrors: string[];

  // Current question
  currentQuestion: {
    id: string;
    text: string;
    inputType: InputType;
    options?: Option[];
    validation?: ValidationRule[];
    helpText?: string;
    required: boolean;
    skipIf?: Condition;
  };

  // Navigation
  history: string[]; // Question IDs visited
  canGoBack: boolean;
  canSkip: boolean;
}
```

---

## 🎯 SUCCESS METRICS

### Conversion Funnel:

```yaml
Landing Page → Start Wizard: Target 15%
  → Track: Click "Start Free Analysis"

Start Wizard → Complete Questions: Target 50%
  → Track: Reach "Analysis Complete"
  → Metric: Average questions answered
  → Metric: Drop-off points

Complete Questions → View Results: Target 95%
  → Track: View recommended route

View Results → Preview Documents: Target 80%
  → Track: Click "See Documents"

Preview Documents → Purchase: Target 10%
  → Track: Complete checkout
  → Metric: Tier selection distribution

Overall Landing → Purchase: Target 1.2%
```

---

**END OF CONVERSATIONAL WIZARD SPECIFICATION**

This document is the definitive guide for building the Landlord Heaven conversational wizard. All development should adhere to these specifications to ensure consistency, reliability, and optimal user experience.
