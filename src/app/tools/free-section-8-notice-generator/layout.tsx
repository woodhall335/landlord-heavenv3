import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Section 8 Notice Generator | Landlord Heaven',
  description:
    'Generate a free Section 8 notice with grounds for possession. Court-ready version with ground-specific validation for £14.99. Free landlord tool.',
  keywords: [
    'free section 8 notice generator',
    'section 8 template',
    'section 8 grounds',
    'eviction notice grounds',
    'landlord tools UK',
    'free section 8 form',
  ],
};

export default function FreeSection8Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
