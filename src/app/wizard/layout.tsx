/**
 * Wizard Layout
 *
 * All wizard pages should be noindex - these are interactive user flows.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
