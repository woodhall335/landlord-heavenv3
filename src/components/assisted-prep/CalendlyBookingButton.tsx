'use client';

import Script from 'next/script';

export function CalendlyBookingButton({ url }: { url: string }) {
  function openCalendly() {
    const calendly = (window as any).Calendly;
    if (calendly?.initPopupWidget) {
      calendly.initPopupWidget({ url });
      return;
    }
    window.location.href = url;
  }

  return (
    <>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={openCalendly}
        className="inline-flex items-center justify-center rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
      >
        Book your callback
      </button>
    </>
  );
}
