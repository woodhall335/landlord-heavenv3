/**
 * Google Analytics gtag.js and Facebook Pixel TypeScript definitions
 */

export {};

declare global {
  interface Window {
    // Google Analytics / Google Ads
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetIdOrDate: string | Date,
      config?: Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams
    ) => void;
    dataLayer: any[];

    // Facebook Pixel
    fbq: (
      command: 'init' | 'track' | 'trackCustom' | 'trackSingle' | 'trackSingleCustom',
      eventNameOrPixelId: string,
      params?: Record<string, any>
    ) => void;
    _fbq: any;
  }
}

declare namespace Gtag {
  interface ConfigParams {
    page_path?: string;
    page_title?: string;
    page_location?: string;
    send_page_view?: boolean;
  }

  interface EventParams {
    event_category?: string;
    event_label?: string;
    value?: number;
    currency?: string;
    transaction_id?: string;
    items?: Array<{
      item_id?: string;
      item_name?: string;
      item_category?: string;
      item_variant?: string;
      price?: number;
      quantity?: number;
    }>;
    [key: string]: any;
  }

  interface CustomParams {
    [key: string]: any;
  }

  type ControlParams = ConfigParams;
}
