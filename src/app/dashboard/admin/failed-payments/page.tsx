import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { createAdminClient, requireServerAuth } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

interface FailedPayment {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  product_type: string;
  total_amount: number;
  payment_status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

interface AdminFailedPaymentsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AdminFailedPaymentsPage({ searchParams }: AdminFailedPaymentsPageProps) {
  let user;
  try {
    user = await requireServerAuth();
  } catch {
    redirect("/auth/login");
  }

  if (!user || !isAdmin(user.id)) {
    redirect("/dashboard");
  }

  const searchTerm = typeof searchParams?.search === "string" ? searchParams.search : "";
  const pageParam = typeof searchParams?.page === "string" ? searchParams.page : "1";
  const parsedPage = Number.parseInt(pageParam, 10);
  const currentPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  const paymentsPerPage = 20;

  // Admin pages use service-role client to bypass RLS for platform-wide data
  const adminClient = createAdminClient();

  let failedPayments: FailedPayment[] = [];

  const { data: orders, error } = await adminClient
    .from("orders")
    .select("id, user_id, product_type, total_amount, payment_status, stripe_payment_intent_id, created_at")
    .in("payment_status", ["failed", "pending"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading failed payments:", error);
  }

  const userIds = Array.from(
    new Set((orders || []).map((order) => order.user_id).filter(Boolean))
  );

  const { data: users } = userIds.length
    ? await adminClient
        .from("users")
        .select("id, email, full_name")
        .in("id", userIds)
    : { data: [] };

  const userMap = new Map(
    (users || []).map((user) => [user.id, { email: user.email, full_name: user.full_name }])
  );

  failedPayments = (orders || []).map((order) => {
    const userInfo = userMap.get(order.user_id);
    return {
      id: order.id,
      user_id: order.user_id,
      user_email: userInfo?.email || "Unknown",
      user_name: userInfo?.full_name || null,
      product_type: order.product_type,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      stripe_payment_intent_id: order.stripe_payment_intent_id,
      created_at: order.created_at,
    };
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredPayments = normalizedSearch
    ? failedPayments.filter(
        (payment) =>
          payment.user_email?.toLowerCase().includes(normalizedSearch) ||
          payment.id.toLowerCase().includes(normalizedSearch)
      )
    : failedPayments;

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedPayments = filteredPayments.slice(
    (safePage - 1) * paymentsPerPage,
    safePage * paymentsPerPage
  );

  const buildQueryString = (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
  };

  function getProductName(productType: string): string {
    const names: Record<string, string> = {
      notice_only: "Notice Only",
      complete_pack: "Complete Eviction Pack",
      money_claim: "Money Claim Pack",
      ast_standard: "Standard AST",
      ast_premium: "Premium AST",
    };
    return names[productType] || productType;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="large">
        <div className="mb-8">
          <Link
            href="/dashboard/admin"
            className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Failed Payments</h1>
          <p className="text-gray-600">View and manage failed payment attempts</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <form className="max-w-md" method="get">
            <label className="block text-sm font-medium text-charcoal mb-2">Search</label>
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Email or Order ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </form>
        </div>

        {/* Failed Payments Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Order ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Customer</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Product</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Amount</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Error</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-600">
                      {searchTerm ? "No failed payments match your search" : "No failed payments found"}
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <span className="text-sm font-mono text-gray-700">{payment.id.slice(0, 8)}...</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700">
                          {new Date(payment.created_at).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-500">
                            {new Date(payment.created_at).toLocaleTimeString()}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-semibold text-charcoal">
                            {payment.user_name || "No name"}
                          </p>
                          <p className="text-xs text-gray-500">{payment.user_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700">{getProductName(payment.product_type)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-charcoal">
                          £{(payment.total_amount / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(payment.payment_status)}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-red-600">
                          Payment failed or pending
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/admin/failed-payments${buildQueryString({
                    search: searchTerm || undefined,
                    page: Math.max(1, safePage - 1),
                  })}`}
                  aria-disabled={safePage === 1}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 ${
                    safePage === 1 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={`/dashboard/admin/failed-payments${buildQueryString({
                    search: searchTerm || undefined,
                    page: Math.min(totalPages, safePage + 1),
                  })}`}
                  aria-disabled={safePage === totalPages}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 ${
                    safePage === totalPages ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Failed</p>
            <p className="text-3xl font-bold text-red-600">{failedPayments.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Lost Revenue</p>
            <p className="text-3xl font-bold text-red-600">
              £
              {(
                failedPayments.reduce((sum, p) => sum + p.total_amount, 0) / 100
              ).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">
              {failedPayments.filter((p) => p.payment_status === "pending").length}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
