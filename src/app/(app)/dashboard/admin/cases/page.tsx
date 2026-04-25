"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import type {
  AdminCaseRecord,
  AdminCasesPreset,
  AdminCasesSortBy,
} from "@/lib/admin/case-manager";
import {
  buildAdminCaseEditHref,
  getAdminCaseTypeLabel,
  getAdminJurisdictionLabel,
} from "@/lib/admin/case-manager";

interface AdminCasesApiResponse {
  success: boolean;
  cases: AdminCaseRecord[];
  stats: {
    total: number;
    paid_or_generated: number;
    requires_action: number;
    failed_fulfillment: number;
    edit_window_open: number;
    docs_ready: number;
  };
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  error?: string;
}

type ModalAction = "retry" | "resume" | "regenerate" | "reopen" | null;

const presetOptions: Array<{ value: AdminCasesPreset; label: string }> = [
  { value: "needs_attention", label: "Needs attention" },
  { value: "paid_awaiting_docs", label: "Paid awaiting docs" },
  { value: "edit_window_open", label: "Edit window open" },
  { value: "docs_ready", label: "Docs ready" },
];

function statusPillClass(status: string | null) {
  if (!status) return "bg-gray-100 text-gray-600";
  if (status === "paid" || status === "fulfilled") return "bg-green-100 text-green-700";
  if (status === "requires_action" || status === "pending" || status === "processing" || status === "ready_to_generate") {
    return "bg-amber-100 text-amber-700";
  }
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

export default function AdminCasesPage() {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [casesLoading, setCasesLoading] = useState(false);
  const [cases, setCases] = useState<AdminCaseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCaseType, setFilterCaseType] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [filterFulfillmentStatus, setFilterFulfillmentStatus] = useState("all");
  const [filterEditWindow, setFilterEditWindow] = useState("all");
  const [filterHasFinalDocuments, setFilterHasFinalDocuments] = useState("all");
  const [preset, setPreset] = useState<AdminCasesPreset>("needs_attention");
  const [sortBy, setSortBy] = useState<AdminCasesSortBy>("risk");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<AdminCasesApiResponse["stats"] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [selectedCase, setSelectedCase] = useState<AdminCaseRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pageSize = 20;

  const loadCases = useCallback(async () => {
    setCasesLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        preset,
        sortBy,
      });

      if (searchTerm) params.set("search", searchTerm);
      if (filterCaseType !== "all") params.set("caseType", filterCaseType);
      if (filterProduct !== "all") params.set("productType", filterProduct);
      if (filterPaymentStatus !== "all") params.set("paymentStatus", filterPaymentStatus);
      if (filterFulfillmentStatus !== "all") params.set("fulfillmentStatus", filterFulfillmentStatus);
      if (filterEditWindow !== "all") params.set("editWindow", filterEditWindow);
      if (filterHasFinalDocuments !== "all") params.set("hasFinalDocuments", filterHasFinalDocuments);

      const response = await fetch(`/api/admin/cases?${params.toString()}`);
      const data: AdminCasesApiResponse = await response.json();

      if (response.status === 403) {
        setHasAccess(false);
        setCases([]);
        setStats(null);
        setTotalPages(1);
        setTotalCount(0);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch cases");
      }

      setHasAccess(true);
      setCases(data.cases || []);
      setStats(data.stats);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalCount(data.meta?.totalCount || 0);
    } catch (error: any) {
      console.error("Error loading admin cases:", error);
      setCases([]);
      setStats(null);
      setTotalPages(1);
      setTotalCount(0);
      setMessage({ type: "error", text: error.message || "Failed to load cases" });
    } finally {
      setCasesLoading(false);
      setLoading(false);
    }
  }, [
    currentPage,
    filterCaseType,
    filterEditWindow,
    filterFulfillmentStatus,
    filterHasFinalDocuments,
    filterPaymentStatus,
    filterProduct,
    pageSize,
    preset,
    searchTerm,
    sortBy,
  ]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterCaseType,
    filterProduct,
    filterPaymentStatus,
    filterFulfillmentStatus,
    filterEditWindow,
    filterHasFinalDocuments,
    preset,
    sortBy,
  ]);

  const uniqueProducts = useMemo(
    () =>
      Array.from(
        new Map(
          cases
            .filter((caseItem) => caseItem.product_type)
            .map((caseItem) => [caseItem.product_type!, caseItem.product_name])
        ).entries()
      ),
    [cases]
  );

  const openModal = (action: Exclude<ModalAction, null>, caseItem: AdminCaseRecord) => {
    setSelectedCase(caseItem);
    setModalAction(action);
  };

  const closeModal = () => {
    setSelectedCase(null);
    setModalAction(null);
  };

  const handleAction = async () => {
    if (!selectedCase || !modalAction) return;

    setActionLoading(true);
    try {
      const actionPath =
        modalAction === "retry"
          ? "retry-fulfillment"
          : modalAction === "resume"
          ? "resume-fulfillment"
          : modalAction === "regenerate"
          ? "regenerate"
          : "reopen-edit-window";

      const response = await fetch(`/api/admin/cases/${selectedCase.case_id}/${actionPath}`, {
        method: "POST",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.message || "Action failed");
      }

      setMessage({
        type: "success",
        text:
          modalAction === "reopen"
            ? "Edit window reopened successfully."
            : modalAction === "regenerate"
            ? "Documents regenerated successfully."
            : modalAction === "resume"
            ? "Fulfillment resumed successfully."
            : "Fulfillment retry started successfully.",
      });

      closeModal();
      await loadCases();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const modalTitle =
    modalAction === "retry"
      ? "Retry fulfillment?"
      : modalAction === "resume"
      ? "Resume fulfillment?"
      : modalAction === "regenerate"
      ? "Regenerate final documents?"
      : "Reopen edit window?";

  const modalMessage =
    modalAction === "retry"
      ? "This will attempt document fulfillment again for the current paid case."
      : modalAction === "resume"
      ? "This will resume fulfillment using the current case facts."
      : modalAction === "regenerate"
      ? "This will delete and regenerate the current final documents from the latest case data."
      : "This will reopen the 30-day edit window from now so support can update answers and regenerate documents.";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-1/3 rounded bg-gray-200" />
            <div className="h-96 rounded bg-gray-200" />
          </div>
        </Container>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="rounded-lg border border-red-200 bg-white p-8 text-center">
            <h1 className="text-2xl font-bold text-charcoal">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You do not have permission to access the admin case manager.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="large">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-charcoal">Admin Case Manager</h1>
          <p className="text-gray-600">
            Support and operations console for paid or generated cases across all users.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Paid / Generated</p>
            <p className="mt-2 text-3xl font-bold text-charcoal">{stats?.paid_or_generated || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Requires Action</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">{stats?.requires_action || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Failed Fulfillment</p>
            <p className="mt-2 text-3xl font-bold text-red-700">{stats?.failed_fulfillment || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Edit Window Open</p>
            <p className="mt-2 text-3xl font-bold text-primary">{stats?.edit_window_open || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Docs Ready</p>
            <p className="mt-2 text-3xl font-bold text-green-700">{stats?.docs_ready || 0}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {presetOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setPreset(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                preset === option.value
                  ? "bg-primary text-white"
                  : "bg-white text-charcoal border border-gray-200 hover:border-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
            <div className="xl:col-span-2">
              <label className="mb-2 block text-sm font-medium text-charcoal">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Case ID, order ID, email..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">Case Type</label>
              <select
                value={filterCaseType}
                onChange={(event) => setFilterCaseType(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="eviction">Eviction</option>
                <option value="money_claim">Money Claim</option>
                <option value="rent_increase">Rent Increase</option>
                <option value="tenancy_agreement">Tenancy</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">Product</label>
              <select
                value={filterProduct}
                onChange={(event) => setFilterProduct(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                {uniqueProducts.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">Payment</label>
              <select
                value={filterPaymentStatus}
                onChange={(event) => setFilterPaymentStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">Fulfillment</label>
              <select
                value={filterFulfillmentStatus}
                onChange={(event) => setFilterFulfillmentStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="requires_action">Requires action</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="pending">Pending</option>
                <option value="ready_to_generate">Ready to generate</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">Edit Window</label>
              <select
                value={filterEditWindow}
                onChange={(event) => setFilterEditWindow(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">Docs</label>
              <select
                value={filterHasFinalDocuments}
                onChange={(event) => setFilterHasFinalDocuments(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="true">Docs ready</option>
                <option value="false">No final docs</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">Sort</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as AdminCasesSortBy)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="risk">Risk first</option>
                <option value="updated">Recently updated</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {casesLoading ? (
            <div className="p-8 text-center text-gray-500">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No matching cases found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Case</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Customer</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Route</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Payment</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Fulfillment</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Docs</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Edit Window</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => (
                    <tr key={caseItem.case_id} className="border-t align-top hover:bg-gray-50">
                      <td className="p-4">
                        <div className="text-sm font-semibold text-charcoal">{caseItem.case_id.slice(0, 8)}...</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {getAdminCaseTypeLabel(caseItem.case_type)} · {getAdminJurisdictionLabel(caseItem.jurisdiction)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Updated {new Date(caseItem.updated_at).toLocaleDateString("en-GB")}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-charcoal">{caseItem.user_name || "No name"}</div>
                        <div className="text-xs text-gray-500">{caseItem.user_email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-charcoal">{caseItem.product_name || "Unknown"}</div>
                        <div className="mt-1 text-xs text-gray-500">Progress {caseItem.wizard_progress}%</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusPillClass(caseItem.payment_status)}`}>
                          {caseItem.payment_status || "none"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusPillClass(caseItem.fulfillment_status)}`}>
                          {caseItem.fulfillment_status || "none"}
                        </span>
                        <div className="mt-2 text-xs text-gray-500">
                          {caseItem.requires_action
                            ? "Needs attention"
                            : caseItem.failed_fulfillment
                            ? "Failed"
                            : caseItem.documents_ready
                            ? "Docs ready"
                            : "In progress"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-charcoal">{caseItem.final_document_count}</div>
                        <div className="text-xs text-gray-500">
                          {caseItem.has_final_documents ? "final docs" : "no final docs"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm font-semibold ${caseItem.edit_window_open ? "text-primary" : "text-gray-600"}`}>
                          {caseItem.edit_window_open ? "Open" : "Closed"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {caseItem.edit_window_ends_at
                            ? new Date(caseItem.edit_window_ends_at).toLocaleDateString("en-GB")
                            : "Not paid"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 text-sm">
                          <Link href={`/dashboard/cases/${caseItem.case_id}`} className="font-semibold text-primary hover:underline">
                            Open case
                          </Link>
                          <Link href={buildAdminCaseEditHref(caseItem)} className="font-semibold text-primary hover:underline">
                            Open edit flow
                          </Link>
                          <Link href={`/dashboard/cases/${caseItem.case_id}#documents`} className="font-semibold text-primary hover:underline">
                            View documents
                          </Link>
                          {caseItem.can_retry_fulfillment && (
                            <button onClick={() => openModal("retry", caseItem)} className="text-left font-semibold text-charcoal hover:text-primary">
                              Retry fulfillment
                            </button>
                          )}
                          {caseItem.can_resume_fulfillment && (
                            <button onClick={() => openModal("resume", caseItem)} className="text-left font-semibold text-charcoal hover:text-primary">
                              Resume fulfillment
                            </button>
                          )}
                          {caseItem.can_regenerate && (
                            <button onClick={() => openModal("regenerate", caseItem)} className="text-left font-semibold text-charcoal hover:text-primary">
                              Regenerate docs
                            </button>
                          )}
                          {caseItem.can_reopen_edit_window && (
                            <button onClick={() => openModal("reopen", caseItem)} className="text-left font-semibold text-charcoal hover:text-primary">
                              Reopen edit window
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cases.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} total cases)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <ConfirmationModal
          isOpen={Boolean(modalAction && selectedCase)}
          onClose={closeModal}
          onConfirm={handleAction}
          title={modalTitle}
          message={modalMessage}
          confirmLabel="Confirm"
          variant={modalAction === "regenerate" ? "warning" : "default"}
          isLoading={actionLoading}
        />
      </Container>
    </div>
  );
}
