import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { tryGetServerUser } from "@/lib/supabase/server";
import { defaultMetadata } from "@/lib/seo";
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  localBusinessSchema
} from "@/lib/seo/structured-data";
import { PopupProvider } from "@/components/providers/PopupProvider";
import { TrackingPixels } from "@/components/analytics/TrackingPixels";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

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
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

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
