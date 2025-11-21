# 🎨 AGENT 1: FRONTEND DEVELOPER - INSTRUCTION FILE

**Role:** UI/UX Implementation  
**Duration:** Days 4-7 (can work in parallel with other agents)  
**Primary Docs:** `/docs/STYLE_GUIDE.md`, `/docs/CONVERSATIONAL_WIZARD_SPECIFICATION.md`

---

## 📋 PRE-REQUISITES

Before starting:
- [ ] Project initialized (Quick Start Checklist complete)
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Design system docs read (`STYLE_GUIDE.md`)
- [ ] UX flow understood (`CONVERSATIONAL_WIZARD_SPECIFICATION.md`)

---

## 🎯 YOUR MISSION

Build all user-facing components and pages with:
- ✅ Clean, modern design (PandaDoc-inspired)
- ✅ Mobile-first responsive
- ✅ 44px minimum touch targets
- ✅ WCAG AA accessibility
- ✅ TypeScript strict mode
- ✅ Consistent with STYLE_GUIDE.md

---

## 📦 DELIVERABLES CHECKLIST

### Phase 1: Design System (Day 4)
- [ ] Color palette implementation
- [ ] Typography system
- [ ] Base UI components
- [ ] Component documentation

### Phase 2: Public Pages (Day 5)
- [ ] Landing page
- [ ] Product pages
- [ ] Pricing page
- [ ] Legal pages (T&C, Privacy)

### Phase 3: Wizard Interface (Day 6)
- [ ] Wizard container
- [ ] 8 input type components
- [ ] Context panel
- [ ] Progress tracking
- [ ] Mobile optimization

### Phase 4: Dashboard & Polish (Day 7)
- [ ] User dashboard
- [ ] HMO Pro dashboard
- [ ] Case management
- [ ] Document viewer
- [ ] Final polish & testing

---

## 🎨 TASK 1: DESIGN SYSTEM SETUP

### Task 1.1: Color Palette

**Reference:** `/docs/STYLE_GUIDE.md` → "COLOR PALETTE" section

```bash
# Command for Claude Code:
"Read /docs/STYLE_GUIDE.md section 'COLOR PALETTE' and create /src/lib/design-system/colors.ts with complete color definitions"
```

**Create:** `/src/lib/design-system/colors.ts`

```typescript
export const colors = {
  // Primary
  primary: {
    DEFAULT: "#10b981",
    dark: "#059669",
    light: "#34d399",
    subtle: "#d1fae5",
  },
  
  // Charcoal
  charcoal: {
    DEFAULT: "#1f2937",
    light: "#374151",
  },
  
  // Secondary
  secondary: {
    DEFAULT: "#6366f1",
    dark: "#4f46e5",
    light: "#a5b4fc",
  },
  
  // Status
  success: {
    DEFAULT: "#10b981",
    bg: "#d1fae5",
  },
  error: {
    DEFAULT: "#ef4444",
    bg: "#fee2e2",
  },
  warning: {
    DEFAULT: "#f59e0b",
    bg: "#fef3c7",
  },
  info: {
    DEFAULT: "#3b82f6",
    bg: "#dbeafe",
  },
  
  // Grays
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

export type ColorKey = keyof typeof colors;
```

**Update:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";
import { colors } from "./src/lib/design-system/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colors,
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "6xl": "3.75rem",
        "5xl": "3rem",
        "4xl": "2.25rem",
        "3xl": "1.875rem",
        "2xl": "1.5rem",
        xl: "1.25rem",
        lg: "1.125rem",
        base: "1rem",
        sm: "0.875rem",
        xs: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Test:**
```bash
npm run dev
# Verify colors work in browser console:
# document.documentElement.style.getPropertyValue('--primary')
```

---

### Task 1.2: Typography System

**Reference:** `/docs/STYLE_GUIDE.md` → "TYPOGRAPHY" section

**Create:** `/src/lib/design-system/typography.ts`

```typescript
export const typography = {
  fontFamily: {
    primary: "var(--font-inter)",
    mono: "var(--font-jetbrains)",
  },
  
  fontSize: {
    display: {
      "6xl": "3.75rem",
      "5xl": "3rem",
      "4xl": "2.25rem",
    },
    heading: {
      "3xl": "1.875rem",
      "2xl": "1.5rem",
      xl: "1.25rem",
      lg: "1.125rem",
    },
    body: {
      base: "1rem",
      sm: "0.875rem",
      xs: "0.75rem",
    },
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};
```

**Setup Fonts:** `/src/app/layout.tsx`

```typescript
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

---

### Task 1.3: Base UI Components

**Reference:** `/docs/STYLE_GUIDE.md` → "COMPONENTS" section

**Create:** `/src/components/ui/Button.tsx`

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md hover:-translate-y-0.5",
        secondary:
          "bg-white text-charcoal border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        outline:
          "border-2 border-primary text-primary hover:bg-primary hover:text-white",
        ghost: "hover:bg-gray-100 text-gray-700",
        danger: "bg-error text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-3 text-sm min-w-[100px]",
        md: "h-11 px-6 text-base min-w-[120px]",
        lg: "h-14 px-8 text-lg min-w-[160px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

**Create:** `/src/components/ui/Card.tsx`

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-bold text-charcoal", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-gray-600", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
```

**Create:** `/src/components/ui/Input.tsx`

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, errorMessage, ...props }, ref) => {
    const hasError = !!errorMessage;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-base text-gray-800 transition-all",
            "placeholder:text-gray-400",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
            "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
            hasError && "border-error focus:border-error focus:ring-error/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !hasError && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
        {errorMessage && (
          <p className="mt-2 text-sm text-error">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
```

**Create:** `/src/components/ui/Badge.tsx`

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        success: "bg-success-bg text-success",
        error: "bg-error-bg text-error",
        warning: "bg-warning-bg text-warning",
        info: "bg-info-bg text-info",
        hmoPro:
          "bg-gradient-to-r from-warning to-yellow-600 text-white shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// HMO Pro specific badge
function HMOProBadge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Badge variant="hmoPro" className={cn("gap-1", className)} {...props}>
      <span>⭐</span>
      HMO Pro
    </Badge>
  );
}

export { Badge, HMOProBadge, badgeVariants };
```

**Test Components:**

Create `/src/app/design-test/page.tsx` to preview:

```typescript
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge, HMOProBadge } from "@/components/ui/Badge";

export default function DesignTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-charcoal">Design System Test</h1>
        
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com"
              helperText="We'll never share your email"
            />
            <Input 
              label="Password" 
              type="password" 
              required
              errorMessage="Password is required"
            />
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <HMOProBadge />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

Visit: `http://localhost:3000/design-test`

---

## 🏠 TASK 2: LANDING PAGE

**Reference:** `/docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md` → "PRODUCT SPECIFICATIONS"

**Create:** `/src/app/page.tsx`

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { HMOProBadge } from "@/components/ui/Badge";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-charcoal mb-6">
          Landlord Heaven
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Generate court-ready legal documents in minutes. No solicitor fees.
          UK-specific. Always up-to-date.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/wizard">Start Free Analysis</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-charcoal text-center mb-12">
          Choose Your Solution
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Notice Only */}
          <Card>
            <CardHeader>
              <CardTitle>Notice Only</CardTitle>
              <CardDescription>Quick start eviction notice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-4">£29.99</div>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ Section 8 or 21 notice</li>
                <li>✓ Serving guidance</li>
                <li>✓ Plain-English instructions</li>
                <li>✓ 12-month storage</li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/wizard?product=notice">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Complete Pack */}
          <Card className="border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle>Complete Eviction Pack</CardTitle>
              <CardDescription>Full DIY eviction bundle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-4">£149.99</div>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ All notices + court forms</li>
                <li>✓ Step-by-step guide</li>
                <li>✓ Evidence checklist</li>
                <li>✓ Lifetime storage</li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/wizard?product=complete">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* HMO Pro */}
          <Card className="border-2 border-warning">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <HMOProBadge />
              </div>
              <CardTitle>HMO Pro Membership</CardTitle>
              <CardDescription>Complete HMO management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-warning mb-1">£19.99</div>
              <div className="text-sm text-gray-500 mb-4">/month</div>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ Unlimited tenant updates</li>
                <li>✓ Council-specific licensing</li>
                <li>✓ Automated reminders</li>
                <li>✓ 7-day free trial</li>
              </ul>
              <Button className="w-full bg-warning hover:bg-yellow-600" asChild>
                <Link href="/hmo-pro">Start Free Trial</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl mb-2">⚖️</div>
            <h3 className="font-bold text-charcoal mb-2">Legally Compliant</h3>
            <p className="text-gray-600">Based on current UK housing law</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-bold text-charcoal mb-2">Secure & Private</h3>
            <p className="text-gray-600">Bank-level encryption</p>
          </div>
          <div>
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-bold text-charcoal mb-2">Instant Generation</h3>
            <p className="text-gray-600">Get documents in minutes</p>
          </div>
        </div>
      </section>
    </main>
  );
}
```

---

## 🧙 TASK 3: CONVERSATIONAL WIZARD

**Reference:** `/docs/CONVERSATIONAL_WIZARD_SPECIFICATION.md` (entire document)

This is your most important task. Read the specification carefully.

**Create:** `/src/app/wizard/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { ConversationPanel } from "@/components/wizard/ConversationPanel";
import { ContextPanel } from "@/components/wizard/ContextPanel";

export default function WizardPage() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [collectedFacts, setCollectedFacts] = useState({});
  const [progress, setProgress] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Conversation (60%) */}
          <div className="lg:col-span-3">
            <ConversationPanel 
              caseId={caseId}
              onAnswer={(data) => {
                setCollectedFacts(prev => ({ ...prev, ...data }));
              }}
              onProgressUpdate={setProgress}
            />
          </div>

          {/* Right: Context (40%) */}
          <div className="lg:col-span-2">
            <ContextPanel 
              collectedFacts={collectedFacts}
              progress={progress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Create:** `/src/components/wizard/ConversationPanel.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { QuestionRenderer } from "./QuestionRenderer";

interface ConversationPanelProps {
  caseId: string | null;
  onAnswer: (data: any) => void;
  onProgressUpdate: (progress: number) => void;
}

export function ConversationPanel({ 
  caseId, 
  onAnswer, 
  onProgressUpdate 
}: ConversationPanelProps) {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch first question on mount
  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wizard/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const data = await response.json();
      setCurrentQuestion(data.question);
      onProgressUpdate(data.progress);
    } catch (error) {
      console.error("Failed to fetch question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: any) => {
    onAnswer(answer);
    await fetchNextQuestion();
  };

  return (
    <Card className="min-h-[600px]">
      <div className="space-y-6">
        {/* Bot Message */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
            🤖
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="text-gray-500">Thinking...</div>
            ) : currentQuestion ? (
              <>
                <div className="text-lg font-medium text-charcoal mb-2">
                  {currentQuestion.text}
                </div>
                {currentQuestion.helpText && (
                  <div className="text-sm text-gray-500 mb-4">
                    💡 {currentQuestion.helpText}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Input Area */}
        {currentQuestion && !loading && (
          <QuestionRenderer 
            question={currentQuestion}
            onSubmit={handleAnswer}
          />
        )}
      </div>
    </Card>
  );
}
```

Continue creating all 8 input type components as specified in the wizard specification...

[File continues with remaining wizard components]

---

## ✅ COMPLETION CHECKLIST

### Phase 1: Design System
- [ ] Color palette implemented
- [ ] Typography configured
- [ ] Button component complete
- [ ] Card component complete
- [ ] Input component complete
- [ ] Badge component complete
- [ ] Design test page works

### Phase 2: Landing Page
- [ ] Hero section
- [ ] Product cards
- [ ] Pricing display
- [ ] Trust indicators
- [ ] Mobile responsive
- [ ] All links work

### Phase 3: Wizard
- [ ] ConversationPanel component
- [ ] ContextPanel component
- [ ] QuestionRenderer component
- [ ] 8 input types implemented
- [ ] Progress tracking works
- [ ] Mobile layout tested

### Phase 4: Dashboard
- [ ] User dashboard page
- [ ] HMO Pro dashboard
- [ ] Property cards
- [ ] Compliance indicators
- [ ] Document library
- [ ] Mobile optimized

---

## 🧪 TESTING PROTOCOL

Test each component:

```bash
# Run dev server
npm run dev

# Test checklist:
- [ ] All colors match STYLE_GUIDE.md
- [ ] Fonts load correctly (Inter)
- [ ] Buttons have 44px minimum height
- [ ] Touch targets work on mobile
- [ ] Forms validate correctly
- [ ] Wizard advances through questions
- [ ] Mobile layout doesn't break
- [ ] No console errors
```

---

## 🚀 HANDOFF TO OTHER AGENTS

Once complete, ensure:

1. **Agent 2 (Backend)** can integrate API calls
2. **Agent 3 (AI)** can inject AI responses
3. **Agent 4 (Payments)** can add checkout flows

Document any component APIs in `/docs/components.md`

---

**END OF AGENT 1 INSTRUCTIONS**

Questions? Check `/docs/STYLE_GUIDE.md` first!
