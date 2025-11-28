"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  user_id: string;
  product_type: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const ordersPerPage = 20;

  const checkAdminAccess = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if user is admin
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];
      if (!adminIds.includes(user.id)) {
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
    const supabase = getSupabaseBrowserClient();
    try {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage - 1);

      // Product filter
      if (filterProduct !== "all") {
        query = query.eq("product_type", filterProduct);
      }

      // Status filter
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      // Sort
      if (sortBy === "date") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "amount") {
        query = query.order("amount", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Load user info for each order
      const ordersWithUsers: Order[] = await Promise.all(
        (data || []).map(async (order: { id: string; user_id: string; product_type: string; amount: number; status: string; stripe_payment_intent_id: string | null; created_at: string }) => {
          const { data: userData } = await supabase
            .from("users")
            .select("email, full_name")
            .eq("id", order.user_id)
            .single<{ email: string; full_name: string | null }>();

          return {
            ...order,
            user_email: userData?.email || undefined,
            user_name: userData?.full_name || undefined,
          };
        })
      );

      // Apply search filter
      let filteredOrders = ordersWithUsers;
      if (searchTerm) {
        filteredOrders = ordersWithUsers.filter(
          (order) =>
            order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setOrders(filteredOrders);
      setTotalPages(Math.ceil((count || 0) / ordersPerPage));
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }, [searchTerm, filterProduct, filterStatus, sortBy, currentPage, ordersPerPage]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (loading) return;
    loadOrders();
  }, [loading, loadOrders]);

  async function handleIssueRefund(orderId: string, amount: number) {
    const confirmed = confirm(
      `Are you sure you want to issue a full refund of £${(amount / 100).toFixed(2)}? This action cannot be undone.`
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
          (order.amount / 100).toFixed(2),
          order.status,
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
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
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
                <option value="succeeded">Succeeded</option>
                <option value="processing">Processing</option>
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
                      <span className="text-sm font-semibold text-charcoal">£{(order.amount / 100).toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          order.status === "succeeded"
                            ? "bg-success/10 text-success"
                            : order.status === "processing"
                            ? "bg-warning/10 text-warning"
                            : order.status === "refunded"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {order.status === "succeeded" && (
                          <>
                            <button
                              onClick={() => handleIssueRefund(order.id, order.amount)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
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
            <p className="text-3xl font-bold text-charcoal">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Successful</p>
            <p className="text-3xl font-bold text-success">
              {orders.filter((o) => o.status === "succeeded").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Refunded</p>
            <p className="text-3xl font-bold text-warning">
              {orders.filter((o) => o.status === "refunded").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-success">
              £
              {(
                orders
                  .filter((o) => o.status === "succeeded")
                  .reduce((sum, o) => sum + o.amount, 0) / 100
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
