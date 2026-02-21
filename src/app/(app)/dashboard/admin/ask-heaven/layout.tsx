import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default function AskHeavenAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
