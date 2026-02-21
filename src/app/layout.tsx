import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { tryGetServerUser } from "@/lib/supabase/server";
import { defaultMetadata } from "@/lib/seo";
import { SITE_ORIGIN } from "@/lib/seo/urls";
import {
  organizationSchema,
  // softwareApplicationSchema removed from global injection - see SEO note below
} from "@/lib/seo/structured-data";
import { PopupProvider } from "@/components/providers/PopupProvider";
import { TrackingPixels } from "@/components/analytics/TrackingPixels";
import { Section21HeaderBanner } from "@/components/ui/Section21HeaderBanner";
import { Analytics } from "@vercel/analytics/next";
import { HeaderModeProvider } from "@/components/layout/HeaderModeContext";


export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: new URL(SITE_ORIGIN),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to get user, but don't fail if Supabase isn't configured (for dev/testing)
  let user = null;
  try {
    user = await tryGetServerUser();
  } catch {
    // Supabase not configured or unavailable - continue without user (anonymous mode)
  }

  // Map user to Header props format
  const headerUser = user?.email
    ? { email: user.email, name: user.user_metadata?.full_name }
    : null;

  return (
    <html lang="en">
      <head>
        {/* DNS Prefetch for third-party domains (preconnect is too aggressive for lazy-loaded scripts) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />

        {/* JSON-LD Structured Data for SEO - Organization schema globally */}
        {/*
          SEO FIX (Jan 2026): SoftwareApplication schema REMOVED from global injection.

          PROBLEM: Google was showing incorrect snippets on product pages:

          ROOT CAUSE: Global SoftwareApplication schema was being combined with
          Product schema on /products/* pages, causing Google to misclassify products
          as "BusinessApplication" with wrong price (AggregateOffer lowPrice).

          SOLUTION:
          - Product pages use their own Product + Offer schema with correct prices
          - SoftwareApplication schema should only be used on tool pages if intentionally desired
          - Organization schema remains global (correct for all pages)

          DO NOT re-add softwareApplicationSchema() here without SEO review.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen overflow-x-hidden">
        <HeaderModeProvider>
          <Section21HeaderBanner />
          <PopupProvider>
            <Header user={headerUser} />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </PopupProvider>
        </HeaderModeProvider>
        <TrackingPixels />
        <Analytics />
      </body>
    </html>
  );
}
