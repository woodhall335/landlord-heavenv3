// src/app/ask-heaven/page.tsx

import React from 'react';
import { Metadata } from 'next';
import AskHeavenPageClient from './AskHeavenPageClient';

export const metadata: Metadata = {
  title: 'Ask Heaven – Free UK Landlord Law Assistant',
  description: 'Get instant answers to landlord-tenant questions and generate the right notices and court documents.',
  keywords: [
    'landlord law',
    'section 21',
    'section 8',
    'eviction',
    'rent arrears',
    'tenancy agreement',
  ],
};

export default function AskHeavenPage(): React.ReactElement {
  return <AskHeavenPageClient />;
}
