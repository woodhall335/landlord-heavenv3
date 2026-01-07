import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { tryGetServerUser } from "@/lib/supabase/server";
import { defaultMetadata } from "@/lib/seo";
import { SITE_ORIGIN } from "@/lib/seo/urls";
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  localBusinessSchema
} from "@/lib/seo/structured-data";
import { PopupProvider } from "@/components/providers/PopupProvider";
import { TrackingPixels } from "@/components/analytics/TrackingPixels";
import { Section21HeaderBanner } from "@/components/ui/Section21HeaderBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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

        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Section21HeaderBanner />
        <PopupProvider>
          <Header user={headerUser} />
          <main className="flex-1">{children}</main>
          <Footer />
        </PopupProvider>
        <TrackingPixels />
      </body>
    </html>
  );
}
