"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  user_id: string;
  product_type: string;
  total_amount: number;
  payment_status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface OrdersApiResponse {
  success: boolean;
  orders: Order[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  error?: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const ordersPerPage = 20;

  const checkAdminAccess = useCallback(async () => {
    try {
      // Use server-side admin check for security (handles env var trimming)
      const response = await fetch("/api/admin/check-access");

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        console.error("Error checking admin access:", response.statusText);
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    }
  }, [router]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      // Build query parameters for the admin API
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("pageSize", ordersPerPage.toString());

      if (filterProduct !== "all") {
        params.set("productType", filterProduct);
      }
      if (filterStatus !== "all") {
        params.set("paymentStatus", filterStatus);
      }
      params.set("sortBy", sortBy);
      params.set("sortOrder", "desc");
      if (searchTerm) {
        params.set("search", searchTerm);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data: OrdersApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalCount(data.meta?.totalCount || 0);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setOrdersLoading(false);
    }
  }, [searchTerm, filterProduct, filterStatus, sortBy, currentPage, ordersPerPage]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (loading) return;
    loadOrders();
  }, [loading, loadOrders]);

  async function handleIssueRefund(orderId: string, totalAmount: number) {
    const confirmed = confirm(
      `Are you sure you want to issue a full refund of £${(totalAmount / 100).toFixed(2)}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to issue refund");
      }

      setMessage({ type: "success", text: "Refund issued successfully!" });
      loadOrders();
    } catch (error: any) {
      console.error("Error issuing refund:", error);
      setMessage({ type: "error", text: error.message || "Failed to issue refund" });
    }
  }

  async function handleResendEmail(orderId: string) {
    try {
      const response = await fetch("/api/admin/orders/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend email");
      }

      setMessage({ type: "success", text: "Confirmation email resent successfully!" });
    } catch (error: any) {
      console.error("Error resending email:", error);
      setMessage({ type: "error", text: error.message || "Failed to resend email" });
    }
  }

  async function handleExportCSV() {
    try {
      const csvData = [
        ["Order ID", "Date", "User Email", "Product", "Amount", "Status"],
        ...orders.map((order) => [
          order.id,
          new Date(order.created_at).toLocaleDateString(),
          order.user_email || "",
          getProductName(order.product_type),
          (order.total_amount / 100).toFixed(2),
          order.payment_status,
        ]),
      ];

      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "CSV exported successfully!" });
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      setMessage({ type: "error", text: "Failed to export CSV" });
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="large">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">Order Management</h1>
            <p className="text-gray-600">View, manage, and process all customer orders</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Export to CSV
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-success/10 text-success border border-success/20"
                : "bg-error/10 text-error border border-error/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email or Order ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Product</label>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="notice_only">Notice Only</option>
                <option value="complete_pack">Complete Pack</option>
                <option value="money_claim">Money Claim</option>
                <option value="ast_standard">Standard AST</option>
                <option value="ast_premium">Premium AST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {ordersLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
              </div>
              <p className="text-gray-500 mt-4">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-charcoal mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || filterProduct !== "all" || filterStatus !== "all"
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Orders will appear here once customers make purchases."}
              </p>
            </div>
          ) : (
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
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <span className="text-sm font-mono text-gray-700">{order.id.slice(0, 8)}...</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{order.user_name || "No name"}</p>
                        <p className="text-xs text-gray-500">{order.user_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">{getProductName(order.product_type)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-charcoal">£{(order.total_amount / 100).toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          order.payment_status === "paid"
                            ? "bg-success/10 text-success"
                            : order.payment_status === "pending"
                            ? "bg-warning/10 text-warning"
                            : order.payment_status === "refunded"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {order.payment_status === "paid" && (
                          <>
                            <button
                              onClick={() => handleIssueRefund(order.id, order.total_amount)}
                              className="text-error hover:underline text-sm"
                            >
                              Refund
                            </button>
                            <button
                              onClick={() => handleResendEmail(order.id)}
                              className="text-primary hover:underline text-sm"
                            >
                              Resend
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {orders.length > 0 && totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} total orders)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-charcoal">{totalCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Paid (on page)</p>
            <p className="text-3xl font-bold text-success">
              {orders.filter((o) => o.payment_status === "paid").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Refunded (on page)</p>
            <p className="text-3xl font-bold text-warning">
              {orders.filter((o) => o.payment_status === "refunded").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Page Revenue</p>
            <p className="text-3xl font-bold text-success">
              £
              {(
                orders
                  .filter((o) => o.payment_status === "paid")
                  .reduce((sum, o) => sum + o.total_amount, 0) / 100
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
