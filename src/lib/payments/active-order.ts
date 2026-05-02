export interface CaseOrderLike {
  payment_status?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
}

function toTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortByRelevantDateDesc<T extends CaseOrderLike>(orders: T[]): T[] {
  return [...orders].sort((left, right) => {
    const rightTime = Math.max(toTimestamp(right.paid_at), toTimestamp(right.created_at));
    const leftTime = Math.max(toTimestamp(left.paid_at), toTimestamp(left.created_at));
    return rightTime - leftTime;
  });
}

export function selectActiveCaseOrder<T extends CaseOrderLike>(
  orders: T[] | null | undefined
): T | null {
  if (!orders || orders.length === 0) {
    return null;
  }

  const paidOrders = orders.filter((order) => order.payment_status === 'paid');
  if (paidOrders.length > 0) {
    return sortByRelevantDateDesc(paidOrders)[0] || null;
  }

  return sortByRelevantDateDesc(orders)[0] || null;
}
