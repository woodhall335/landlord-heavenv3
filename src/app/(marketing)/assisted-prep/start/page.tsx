import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepIntakeForm } from '@/components/assisted-prep/AssistedPrepIntakeForm';

export const metadata: Metadata = {
  title: 'Start Assisted Prep | Landlord Heaven',
  description: 'Start a short assisted prep intake for a Section 8 notice, money claim, or possession claim pack.',
};

export default function AssistedPrepStartPage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <Suspense fallback={<div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">Loading assisted prep...</div>}>
          <AssistedPrepIntakeForm />
        </Suspense>
      </main>
    </>
  );
}
