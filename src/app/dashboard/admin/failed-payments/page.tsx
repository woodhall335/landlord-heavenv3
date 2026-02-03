"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AdminFailedPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [failedPayments, setFailedPayments] = useState<FailedPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 20;

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

  const loadFailedPayments = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    try {
      // Fetch orders with failed or pending status - use payment_status from schema
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .in("payment_status", ["failed", "pending"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load user info for each failed payment
      const paymentsWithUsers: FailedPayment[] = await Promise.all(
        (orders || []).map(async (order: any) => {
          const { data: userData } = await supabase
            .from("users")
            .select("email, full_name")
            .eq("id", order.user_id)
            .single<{ email: string; full_name: string | null }>();

          return {
            id: order.id,
            user_id: order.user_id,
            user_email: userData?.email || "Unknown",
            user_name: userData?.full_name || null,
            product_type: order.product_type,
            total_amount: order.total_amount,
            payment_status: order.payment_status,
            stripe_payment_intent_id: order.stripe_payment_intent_id,
            created_at: order.created_at,
          };
        })
      );

      setFailedPayments(paymentsWithUsers);
    } catch (error) {
      console.error("Error loading failed payments:", error);
    }
  }, []);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (loading) return;
    loadFailedPayments();
  }, [loading, loadFailedPayments]);

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

  // Apply search filter
  const filteredPayments = failedPayments.filter(
    (payment) =>
      payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

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
          <div className="max-w-md">
            <label className="block text-sm font-medium text-charcoal mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Email or Order ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
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
