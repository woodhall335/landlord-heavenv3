export const DAILY_REVENUE_TARGET_GBP = 250;

const PRODUCT_REPORT_LABELS: Record<string, string> = {
  notice_only: 'Notice Only Pack',
  complete_pack: 'Complete Eviction Pack',
  money_claim: 'Money Claim Pack',
  section13_standard: 'Supported Rent Increase Pack',
  section13_defensive: 'Tribunal-Ready Rent Increase Pack',
  ast_standard: 'Standard Tenancy Agreement',
  ast_premium: 'Premium Tenancy Agreement',
  england_standard_tenancy_agreement: 'Standard Tenancy Agreement',
  england_premium_tenancy_agreement: 'Premium Tenancy Agreement',
  england_student_tenancy_agreement: 'Student Tenancy Agreement',
  england_hmo_shared_house_tenancy_agreement: 'HMO Shared House Tenancy Agreement',
  england_lodger_agreement: 'Lodger Agreement',
  residential_tenancy_application: 'Residential Tenancy Application',
};

export interface GrowthOrderRow {
  id?: string;
  product_type?: string | null;
  total_amount?: number | null;
  payment_status?: string | null;
  created_at?: string | null;
  paid_at?: string | null;
  landing_path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  referrer?: string | null;
  marketing_session_id?: string | null;
}

export interface GrowthMarketingEventRow {
  event_name: string;
  marketing_session_id?: string | null;
  source_page?: string | null;
  page_path?: string | null;
  page_type?: string | null;
  intent?: string | null;
  cta_position?: string | null;
  destination?: string | null;
  recommended_product?: string | null;
  product_clicked?: string | null;
  user_type?: string | null;
  tool_name?: string | null;
  created_at?: string | null;
  event_payload?: Record<string, string | number | boolean | null> | null;
}

export interface GrowthMetricGroup {
  key: string;
  label: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface GrowthDayMetric {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
  rolling7DayRevenue: number;
  gapToDailyTarget: number;
}

export interface GrowthRateMetric {
  key: string;
  label: string;
  numerator: number;
  denominator: number;
  views?: number;
  clicks?: number;
  starts?: number;
  completions?: number;
  productClicks?: number;
  checkoutStarts?: number;
  rate: number | null;
}

export interface GrowthReportResponse {
  success: true;
  days: 7 | 30;
  summary: {
    revenue: number;
    orders: number;
    aov: number;
    rolling7DayRevenue: number;
    rolling7DayOrders: number;
    dailyTargetRevenue: number;
    rolling7DayTargetRevenue: number;
    rolling7DayGap: number;
  };
  revenueByDay: GrowthDayMetric[];
  revenueByProduct: GrowthMetricGroup[];
  revenueByLandingPath: GrowthMetricGroup[];
  revenueBySourceMedium: GrowthMetricGroup[];
  funnelStages: Array<{ event: string; label: string; count: number }>;
  journeyRates: Array<{ key: string; label: string; numerator: number; denominator: number; rate: number | null }>;
  funnelRates: {
    ctaClickRateByPage: GrowthRateMetric[];
    toolStartRate: GrowthRateMetric[];
    toolCompletionRate: GrowthRateMetric[];
    productPageConversionRate: GrowthRateMetric[];
    checkoutStartRate: GrowthRateMetric[];
  };
  target: {
    dailyRevenue: number;
    rolling7DayRevenue: number;
  };
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function safeAmount(value: number | null | undefined): number {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function groupLabel(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function productReportLabel(value: string): string {
  return PRODUCT_REPORT_LABELS[value] || value;
}

function getOrderDate(order: GrowthOrderRow): Date | null {
  return parseDate(order.paid_at || order.created_at);
}

function getSourceMedium(order: GrowthOrderRow): string {
  if (order.utm_source || order.utm_medium) {
    return `${groupLabel(order.utm_source, 'unknown')} / ${groupLabel(order.utm_medium, 'unknown')}`;
  }

  const referrer = order.referrer?.toLowerCase();
  if (referrer?.includes('google.')) return 'google / organic';
  if (referrer) return `${referrer} / referral`;

  return 'direct / none';
}

function buildGroup(
  rows: GrowthOrderRow[],
  getKey: (row: GrowthOrderRow) => string,
  getLabel: (key: string) => string = (key) => key
): GrowthMetricGroup[] {
  const grouped = new Map<string, GrowthMetricGroup>();

  rows.forEach((row) => {
    const key = getKey(row);
    const current = grouped.get(key) || { key, label: getLabel(key), revenue: 0, orders: 0, aov: 0 };
    current.revenue += safeAmount(row.total_amount);
    current.orders += 1;
    grouped.set(key, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      revenue: roundMoney(item.revenue),
      aov: item.orders > 0 ? roundMoney(item.revenue / item.orders) : 0,
    }))
    .sort((left, right) => right.revenue - left.revenue || right.orders - left.orders);
}

function countBy<T>(rows: T[], getKey: (row: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const key = getKey(row);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

function buildRateRows(
  denominator: Map<string, number>,
  numerator: Map<string, number>,
  numeratorLabel: 'clicks' | 'starts' | 'completions' | 'checkoutStarts' | 'productClicks',
  denominatorLabel: 'views' | 'clicks' | 'starts' | 'productClicks'
): GrowthRateMetric[] {
  const keys = new Set([...denominator.keys(), ...numerator.keys()]);

  return [...keys]
    .map((key) => {
      const den = denominator.get(key) || 0;
      const num = numerator.get(key) || 0;
      return {
        key,
        label: key,
        numerator: num,
        denominator: den,
        [denominatorLabel]: den,
        [numeratorLabel]: num,
        rate: pct(num, den),
      } as GrowthRateMetric;
    })
    .sort((left, right) => (right.rate ?? -1) - (left.rate ?? -1));
}

export function normalizeGrowthReportDays(value: string | null | undefined): 7 | 30 {
  return value === '30' ? 30 : 7;
}

export function buildGrowthReport(params: {
  orders: GrowthOrderRow[];
  events: GrowthMarketingEventRow[];
  days: 7 | 30;
  now?: Date;
  filters?: {
    sourceRoute?: string;
    product?: string;
    device?: string;
    trafficSource?: string;
    experiment?: string;
    authenticatedState?: string;
  };
}): GrowthReportResponse {
  const now = params.now || new Date();
  const todayStart = startOfUtcDay(now);
  const rangeStart = addUtcDays(todayStart, -(params.days - 1));
  const rolling7Start = addUtcDays(todayStart, -6);

  const paidOrders = params.orders
    .filter((order) => order.payment_status === 'paid')
    .filter((order) => {
      const orderDate = getOrderDate(order);
      return orderDate ? orderDate >= rangeStart : false;
    });

  const rolling7Orders = paidOrders.filter((order) => {
    const orderDate = getOrderDate(order);
    return orderDate ? orderDate >= rolling7Start : false;
  });

  const revenue = paidOrders.reduce((sum, order) => sum + safeAmount(order.total_amount), 0);
  const rolling7DayRevenue = rolling7Orders.reduce((sum, order) => sum + safeAmount(order.total_amount), 0);

  const revenueByDay = Array.from({ length: params.days }, (_, index) => {
    const date = addUtcDays(rangeStart, index);
    const dateKey = toDateKey(date);
    const matching = paidOrders.filter((order) => {
      const orderDate = getOrderDate(order);
      return orderDate ? toDateKey(orderDate) === dateKey : false;
    });

    const dayRevenue = matching.reduce((sum, order) => sum + safeAmount(order.total_amount), 0);
    const rollingWindowStart = addUtcDays(date, -6);
    const rollingMatching = paidOrders.filter((order) => {
      const orderDate = getOrderDate(order);
      return orderDate ? orderDate >= rollingWindowStart && orderDate <= addUtcDays(date, 1) : false;
    });
    const rollingRevenue = rollingMatching.reduce((sum, order) => sum + safeAmount(order.total_amount), 0);

    return {
      date: dateKey,
      revenue: roundMoney(dayRevenue),
      orders: matching.length,
      aov: matching.length > 0 ? roundMoney(dayRevenue / matching.length) : 0,
      rolling7DayRevenue: roundMoney(rollingRevenue),
      gapToDailyTarget: roundMoney(Math.max(0, DAILY_REVENUE_TARGET_GBP - dayRevenue)),
    };
  });

  const eventsInRange = params.events.filter((event) => {
    const eventDate = parseDate(event.created_at);
    if (!eventDate || eventDate < rangeStart) return false;
    const payload = event.event_payload || {};
    if (params.filters?.sourceRoute && (event.source_page || event.page_path) !== params.filters.sourceRoute) return false;
    if (params.filters?.product && (event.product_clicked || event.recommended_product || payload.productSlug) !== params.filters.product) return false;
    if (params.filters?.device && payload.deviceCategory !== params.filters.device) return false;
    if (params.filters?.trafficSource && payload.trafficSource !== params.filters.trafficSource) return false;
    if (params.filters?.experiment && !String(payload.experimentId || '').startsWith(params.filters.experiment)) return false;
    if (params.filters?.authenticatedState && String(payload.authenticatedState) !== params.filters.authenticatedState) return false;
    return true;
  });

  const eventPage = (event: GrowthMarketingEventRow) =>
    groupLabel(event.source_page || event.page_path, 'unknown');
  const eventTool = (event: GrowthMarketingEventRow) =>
    groupLabel(event.tool_name || event.intent, 'unknown');
  const eventProduct = (event: GrowthMarketingEventRow) =>
    groupLabel(event.product_clicked || event.recommended_product, 'unknown');

  const bridgeViews = eventsInRange.filter((event) => ['commercial_bridge_viewed', 'contextual_offer_view'].includes(event.event_name));
  const bridgeClicks = eventsInRange.filter((event) => ['commercial_bridge_clicked', 'contextual_offer_click'].includes(event.event_name));
  const toolStarts = eventsInRange.filter((event) => event.event_name === 'tool_started');
  const toolCompletions = eventsInRange.filter((event) => event.event_name === 'tool_completed');
  const productClicks = eventsInRange.filter((event) => event.event_name === 'product_cta_clicked');
  const checkoutStarts = eventsInRange.filter((event) => ['checkout_started', 'checkout_opened'].includes(event.event_name));
  const funnelStageDefinitions = [
    ['organic_landing_view', 'Landing views'],
    ['contextual_offer_view', 'Offer views'],
    ['contextual_offer_click', 'Offer clicks'],
    ['product_view', 'Product views'],
    ['product_primary_cta_click', 'Primary CTA clicks'],
    ['builder_started', 'Builder starts'],
    ['builder_step_completed', 'Step completions'],
    ['preview_generated', 'Previews generated'],
    ['checkout_opened', 'Checkout opens'],
    ['payment_succeeded', 'Payments'],
    ['document_delivered', 'Documents delivered'],
  ] as const;
  const stageCount = (name: string) => eventsInRange.filter((event) => event.event_name === name).length;
  const stageRate = (key: string, label: string, numeratorEvent: string, denominatorEvent: string) => {
    const numerator = stageCount(numeratorEvent);
    const denominator = stageCount(denominatorEvent);
    return { key, label, numerator, denominator, rate: pct(numerator, denominator) };
  };

  const rolling7DayTargetRevenue = DAILY_REVENUE_TARGET_GBP * 7;

  return {
    success: true,
    days: params.days,
    summary: {
      revenue: roundMoney(revenue),
      orders: paidOrders.length,
      aov: paidOrders.length > 0 ? roundMoney(revenue / paidOrders.length) : 0,
      rolling7DayRevenue: roundMoney(rolling7DayRevenue),
      rolling7DayOrders: rolling7Orders.length,
      dailyTargetRevenue: DAILY_REVENUE_TARGET_GBP,
      rolling7DayTargetRevenue,
      rolling7DayGap: roundMoney(Math.max(0, rolling7DayTargetRevenue - rolling7DayRevenue)),
    },
    revenueByDay,
    revenueByProduct: buildGroup(
      paidOrders,
      (order) => groupLabel(order.product_type, 'unknown'),
      productReportLabel
    ),
    revenueByLandingPath: buildGroup(paidOrders, (order) => groupLabel(order.landing_path, 'unknown')),
    revenueBySourceMedium: buildGroup(paidOrders, getSourceMedium),
    funnelStages: funnelStageDefinitions.map(([event, label]) => ({ event, label, count: stageCount(event) })),
    journeyRates: [
      stageRate('offer_ctr', 'Offer CTR', 'contextual_offer_click', 'contextual_offer_view'),
      stageRate('landing_to_product', 'Landing to product', 'product_view', 'organic_landing_view'),
      stageRate('product_to_builder', 'Product to builder', 'builder_started', 'product_view'),
      stageRate('builder_to_preview', 'Builder to preview', 'preview_generated', 'builder_started'),
      stageRate('preview_to_checkout', 'Preview to checkout', 'checkout_opened', 'preview_generated'),
      stageRate('checkout_to_payment', 'Checkout to payment', 'payment_succeeded', 'checkout_opened'),
      stageRate('landing_to_sale', 'Landing to sale', 'payment_succeeded', 'organic_landing_view'),
    ],
    funnelRates: {
      ctaClickRateByPage: buildRateRows(
        countBy(bridgeViews, eventPage),
        countBy(bridgeClicks, eventPage),
        'clicks',
        'views'
      ),
      toolStartRate: buildRateRows(
        countBy(bridgeClicks.filter((event) => event.destination?.includes('/tools/')), eventTool),
        countBy(toolStarts, eventTool),
        'starts',
        'clicks'
      ),
      toolCompletionRate: buildRateRows(
        countBy(toolStarts, eventTool),
        countBy(toolCompletions, eventTool),
        'completions',
        'starts'
      ),
      productPageConversionRate: buildRateRows(
        countBy(productClicks, eventProduct),
        countBy(checkoutStarts, eventProduct),
        'checkoutStarts',
        'productClicks'
      ),
      checkoutStartRate: buildRateRows(
        countBy(bridgeClicks, (event) => groupLabel(event.intent, 'unknown')),
        countBy(checkoutStarts, (event) => groupLabel(event.intent || event.product_clicked, 'unknown')),
        'checkoutStarts',
        'clicks'
      ),
    },
    target: {
      dailyRevenue: DAILY_REVENUE_TARGET_GBP,
      rolling7DayRevenue: rolling7DayTargetRevenue,
    },
  };
}
