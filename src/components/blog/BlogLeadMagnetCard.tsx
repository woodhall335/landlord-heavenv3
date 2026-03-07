'use client';

import { FormEvent, useId, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface BlogLeadMagnetCardProps {
  postSlug: string;
  category: string;
}

export function BlogLeadMagnetCard({ postSlug, category }: BlogLeadMagnetCardProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const modalTitleId = useId();

  const onDownload = () => {
    trackEvent('click_blog_download_pdf', { slug: postSlug, category, placement: 'lead_magnet' });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    trackEvent('submit_blog_checklist_email', {
      slug: postSlug,
      category,
      placement: 'lead_magnet',
      email_domain: email.split('@')[1] ?? 'unknown',
    });
    setOpen(false);
    setEmail('');
  };

  return (
    <section className="my-8 rounded-2xl border border-[#e9dcff] bg-[#f8f1ff] p-5">
      <h3 className="text-lg font-semibold text-slate-900">Download landlord checklist</h3>
      <p className="mt-1 text-sm text-slate-700">Free PDF with step-by-step compliance actions based on this guide.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="/docs/section21-precheck.pdf"
          onClick={onDownload}
          className="inline-flex rounded-lg bg-[#692ed4] px-4 py-2.5 font-semibold text-white"
        >
          Download PDF
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex rounded-lg border border-[#692ed4] px-4 py-2.5 font-semibold text-[#692ed4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
        >
          Email me the checklist
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby={modalTitleId}>
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h4 id={modalTitleId} className="font-semibold text-slate-900">Send checklist to your inbox</h4>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <label className="block text-sm text-slate-700" htmlFor="lead-email">Email address</label>
              <input
                id="lead-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <div className="flex gap-2">
                <button type="submit" className="rounded-lg bg-[#692ed4] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2">Send</button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
