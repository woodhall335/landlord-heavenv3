import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { getServerUser } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Landlord Heaven - Legal Documents for UK Landlords",
  description:
    "Court-ready eviction notices, tenancy agreements & legal documents for UK landlords. 100% UK coverage - England & Wales, Scotland, Northern Ireland.",
  keywords: [
    "section 8 notice",
    "section 21 notice",
    "eviction notice",
    "tenancy agreement",
    "landlord legal documents",
    "UK landlord",
    "rent arrears",
    "HMO licence",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
