"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
import { ADMIN_PRODUCT_OPTIONS } from "@/lib/admin/products";
import { isAssistedPrepSku, type AssistedPrepStatus } from "@/lib/assisted-prep";

interface AdminCasesApiResponse {
  success: boolean;
  cases: AdminCaseRecord[];
  stats: {
    total: number;
    paid_or_generated: number;
    requires_action: number;
    failed_fulfillment: number;
    started_drafts: number;
    unpaid_started: number;
    anonymous_started: number;
    preview_abandoned: number;
    edit_window_open: number;
    docs_ready: number;
    restart_link_available: number;
    recovery_emails_sent_30d: number;
  };
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    cleanupPolicy?: {
      appliesTo: string;
      retentionDays: number;
      excludes: string[];
    };
  };
  error?: string;
}

type ModalAction = "retry" | "resume" | "regenerate" | "reopen" | "restart" | "delete" | null;

const presetOptions: Array<{ value: AdminCasesPreset; label: string }> = [
  { value: "needs_attention", label: "Needs attention" },
  { value: "started_drafts", label: "Started drafts" },
  { value: "paid_awaiting_docs", label: "Paid awaiting docs" },
  { value: "preview_abandoned", label: "Preview abandoned" },
  { value: "edit_window_open", label: "Edit window open" },
  { value: "docs_ready", label: "Docs ready" },
];

function statusPillClass(status: string | null) {
  if (!status) return "bg-gray-100 text-gray-600";
  if (status === "paid" || status === "fulfilled") return "bg-green-100 text-green-700";
  if (
    status === "requires_action" ||
    status === "pending" ||
    status === "processing" ||
    status === "ready_to_generate" ||
    status === "callback_pending" ||
    status === "callback_booked" ||
    status === "in_review"
  ) {
    return "bg-amber-100 text-amber-700";
  }
  if (status === "pack_prepared" || status === "sent_to_customer" || status === "completed") return "bg-green-100 text-green-700";
  if (status === "blocked_refund_due") return "bg-red-100 text-red-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function formatDateTime(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function recoveryStageLabel(stage: AdminCaseRecord["recovery_last_stage"]) {
  if (stage === "day_1") return "Day 1";
  if (stage === "day_7") return "Day 7";
  if (stage === "manual") return "Manual";
  return "None";
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
  const [cleanupPolicy, setCleanupPolicy] = useState<AdminCasesApiResponse["meta"]["cleanupPolicy"] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [selectedCase, setSelectedCase] = useState<AdminCaseRecord | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [bulkRestartLoading, setBulkRestartLoading] = useState(false);

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
        setCleanupPolicy(null);
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
      setCleanupPolicy(data.meta?.cleanupPolicy || null);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalCount(data.meta?.totalCount || 0);
    } catch (error: any) {
      console.error("Error loading admin cases:", error);
      setCases([]);
      setStats(null);
      setCleanupPolicy(null);
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
    setSelectedCaseIds((current) =>
      current.filter((caseId) => cases.some((caseItem) => caseItem.case_id === caseId))
    );
  }, [cases]);

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

  const openModal = (action: Exclude<ModalAction, null>, caseItem: AdminCaseRecord) => {
    setSelectedCase(caseItem);
    setModalAction(action);
    setDeleteConfirmationText("");
  };

  const closeModal = () => {
    setSelectedCase(null);
    setModalAction(null);
    setDeleteConfirmationText("");
  };

  const handleAction = async () => {
    if (!selectedCase || !modalAction) return;

    setActionLoading(true);
    try {
      if (modalAction === "delete") {
        if (deleteConfirmationText !== "DELETE") {
          throw new Error("Type DELETE to confirm permanent deletion.");
        }

        const response = await fetch(`/api/admin/cases/${selectedCase.case_id}`, {
          method: "DELETE",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || payload.message || "Failed to delete case");
        }

        const detachedOrders = Number(payload.order_links_detached_by_on_delete_set_null || 0);
        const storageRemoved = Number(payload.storage_removed || 0);
        setMessage({
          type: "success",
          text: `Case permanently deleted. ${detachedOrders} linked order${detachedOrders === 1 ? "" : "s"} detached; ${storageRemoved} document file${storageRemoved === 1 ? "" : "s"} removed.`,
        });
        setCases((current) => current.filter((caseItem) => caseItem.case_id !== selectedCase.case_id));
        closeModal();
        await loadCases();
        return;
      }

      const actionPath =
        modalAction === "retry"
          ? "retry-fulfillment"
          : modalAction === "resume"
          ? "resume-fulfillment"
          : modalAction === "regenerate"
          ? "regenerate"
          : modalAction === "restart"
          ? "send-restart-link"
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
            : modalAction === "restart"
            ? "Restart link sent successfully."
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

  async function handleAssistedStatus(caseItem: AdminCaseRecord, status: AssistedPrepStatus) {
    if (!caseItem.order_id) return;
    const note = window.prompt("Optional internal note for this status change:", "") || "";
    try {
      const response = await fetch("/api/admin/orders/assisted-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: caseItem.order_id, status, note }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update assisted status");
      }
      setMessage({ type: "success", text: `Assisted status updated to ${status}.` });
      await loadCases();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update assisted status" });
    }
  }

  async function handleAssistedEmail(
    caseItem: AdminCaseRecord,
    emailType:
      | "missing_information"
      | "blockers_action_summary"
      | "no_show_reschedule"
      | "no_response_refund_offer"
      | "refund_processed"
      | "pack_ready"
  ) {
    if (!caseItem.order_id) return;
    const noteRequired = emailType === "missing_information" || emailType === "blockers_action_summary";
    const note = noteRequired
      ? window.prompt("Add the missing information or blocker summary to send to the customer:", "")
      : window.prompt("Optional message to include:", "") || "";

    if (noteRequired && !note?.trim()) {
      setMessage({ type: "error", text: "Please add a short message before sending this email." });
      return;
    }

    const url =
      emailType === "pack_ready"
        ? "/api/admin/orders/send-assisted-ready"
        : "/api/admin/orders/assisted-email";
    const body =
      emailType === "pack_ready"
        ? { orderId: caseItem.order_id }
        : { orderId: caseItem.order_id, emailType, note: note || null };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to send assisted email");
      }
      setMessage({ type: "success", text: "Assisted email sent successfully." });
      await loadCases();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to send assisted email" });
    }
  }

  const restartableCases = cases.filter((caseItem) => caseItem.can_send_restart_link);
  const selectedRestartableCases = cases.filter(
    (caseItem) => selectedCaseIds.includes(caseItem.case_id) && caseItem.can_send_restart_link
  );
  const allRestartableOnPageSelected =
    restartableCases.length > 0 &&
    restartableCases.every((caseItem) => selectedCaseIds.includes(caseItem.case_id));

  const toggleSelectedCase = (caseItem: AdminCaseRecord) => {
    if (!caseItem.can_send_restart_link) return;

    setSelectedCaseIds((current) =>
      current.includes(caseItem.case_id)
        ? current.filter((caseId) => caseId !== caseItem.case_id)
        : [...current, caseItem.case_id]
    );
  };

  const toggleAllRestartableOnPage = () => {
    const restartableIds = restartableCases.map((caseItem) => caseItem.case_id);
    setSelectedCaseIds((current) => {
      if (restartableIds.every((caseId) => current.includes(caseId))) {
        return current.filter((caseId) => !restartableIds.includes(caseId));
      }

      return Array.from(new Set([...current, ...restartableIds]));
    });
  };

  const handleBulkRestartLinks = async () => {
    if (selectedRestartableCases.length === 0) return;

    setBulkRestartLoading(true);
    setMessage(null);

    let sent = 0;
    const failures: string[] = [];

    for (const caseItem of selectedRestartableCases) {
      try {
        const response = await fetch(`/api/admin/cases/${caseItem.case_id}/send-restart-link`, {
          method: "POST",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || payload.message || "Failed to send restart link");
        }

        sent += 1;
      } catch (error: any) {
        failures.push(`${caseItem.case_id.slice(0, 8)}: ${error.message || "failed"}`);
      }
    }

    setSelectedCaseIds([]);
    await loadCases();
    setBulkRestartLoading(false);

    if (failures.length) {
      setMessage({
        type: sent > 0 ? "success" : "error",
        text: `Sent ${sent} restart link${sent === 1 ? "" : "s"}; ${failures.length} failed. ${failures.slice(0, 3).join("; ")}`,
      });
    } else {
      setMessage({
        type: "success",
        text: `Sent ${sent} restart link${sent === 1 ? "" : "s"} successfully.`,
      });
    }
  };

  const modalTitle =
    modalAction === "retry"
      ? "Retry fulfillment?"
      : modalAction === "resume"
      ? "Resume fulfillment?"
      : modalAction === "regenerate"
      ? "Regenerate final documents?"
      : modalAction === "restart"
      ? "Send restart link?"
      : modalAction === "delete"
      ? "Permanently delete this case?"
      : "Reopen edit window?";

  const modalMessage =
    modalAction === "retry"
      ? "This will attempt document fulfillment again for the current paid case."
      : modalAction === "resume"
      ? "This will resume fulfillment using the current case facts."
      : modalAction === "regenerate"
      ? "This will delete and regenerate the current final documents from the latest case data."
      : modalAction === "restart"
      ? "This will email the customer a secure link to resume their saved draft and continue to checkout."
      : modalAction === "delete"
      ? (
        <div className="space-y-3 text-left">
          <p>
            This permanently deletes the case and linked case data. Linked orders are kept, but their case link is removed by the database.
          </p>
          <p className="font-semibold text-red-700">
            This cannot be undone. Type DELETE to confirm.
          </p>
          <input
            value={deleteConfirmationText}
            onChange={(event) => setDeleteConfirmationText(event.target.value)}
            placeholder="DELETE"
            className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-charcoal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>
      )
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
            Support and operations console for paid cases, generated packs, abandoned previews, and started drafts.
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

        <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-10">
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
            <p className="text-sm text-gray-600">Started Drafts</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{stats?.started_drafts || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Unpaid Started</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{stats?.unpaid_started || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Anonymous Started</p>
            <p className="mt-2 text-3xl font-bold text-slate-700">{stats?.anonymous_started || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Preview Abandoned</p>
            <p className="mt-2 text-3xl font-bold text-purple-700">{stats?.preview_abandoned || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Edit Window Open</p>
            <p className="mt-2 text-3xl font-bold text-primary">{stats?.edit_window_open || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Docs Ready</p>
            <p className="mt-2 text-3xl font-bold text-green-700">{stats?.docs_ready || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Recovery Sent 30d</p>
            <p className="mt-2 text-3xl font-bold text-purple-700">{stats?.recovery_emails_sent_30d || 0}</p>
            <p className="mt-1 text-xs text-gray-500">{stats?.restart_link_available || 0} restartable now</p>
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

        {preset === "started_drafts" && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
            <p className="font-semibold">Started draft cleanup</p>
            <p className="mt-1">
              Automatic cleanup currently applies only to {cleanupPolicy?.appliesTo || "anonymous unclaimed wizard cases with no linked checkout order"} older than {cleanupPolicy?.retentionDays || 14} days. Logged-in drafts and cases with orders stay visible here until an admin deletes them.
            </p>
          </div>
        )}

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
                {ADMIN_PRODUCT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                <option value="callback_pending">Callback pending</option>
                <option value="callback_booked">Callback booked</option>
                <option value="in_review">In review</option>
                <option value="blocked_refund_due">Blocked refund due</option>
                <option value="pack_prepared">Pack prepared</option>
                <option value="sent_to_customer">Sent to customer</option>
                <option value="completed">Completed</option>
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

        {preset === "preview_abandoned" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div>
              <p className="text-sm font-semibold text-purple-950">Bulk preview recovery</p>
              <p className="mt-1 text-xs text-purple-800">
                {selectedRestartableCases.length} selected with usable email - {restartableCases.length} restartable on this page
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleAllRestartableOnPage}
                disabled={restartableCases.length === 0 || bulkRestartLoading}
                className="rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-semibold text-purple-800 hover:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {allRestartableOnPageSelected ? "Clear page selection" : "Select restartable on page"}
              </button>
              <button
                type="button"
                onClick={handleBulkRestartLinks}
                disabled={selectedRestartableCases.length === 0 || bulkRestartLoading}
                className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkRestartLoading
                  ? "Sending..."
                  : `Send ${selectedRestartableCases.length || ""} restart link${selectedRestartableCases.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}

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
                    <th className="w-12 p-4 text-left text-sm font-semibold text-charcoal">
                      <input
                        type="checkbox"
                        aria-label="Select all restartable cases on this page"
                        checked={allRestartableOnPageSelected}
                        onChange={toggleAllRestartableOnPage}
                        disabled={restartableCases.length === 0 || bulkRestartLoading}
                        className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Case</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Customer</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Route</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Payment</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Fulfillment</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Docs</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Edit Window</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Recovery</th>
                    <th className="p-4 text-left text-sm font-semibold text-charcoal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => (
                    <tr key={caseItem.case_id} className="border-t align-top hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          aria-label={`Select case ${caseItem.case_id}`}
                          checked={selectedCaseIds.includes(caseItem.case_id)}
                          onChange={() => toggleSelectedCase(caseItem)}
                          disabled={!caseItem.can_send_restart_link || bulkRestartLoading}
                          className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
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
                        {caseItem.is_preview_abandoned && (
                          <div className="mt-2 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                            Preview abandoned
                          </div>
                        )}
                        {caseItem.is_started_draft && (
                          <div className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                            Started draft
                          </div>
                        )}
                        {caseItem.is_anonymous_started && (
                          <div className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            Anonymous draft
                          </div>
                        )}
                        {caseItem.assisted_intake?.case_overview && (
                          <div className="mt-2 max-w-[16rem] rounded bg-violet-50 p-2 text-xs text-violet-900">
                            <div className="font-semibold">Assisted intake</div>
                            <div>{caseItem.assisted_intake.case_overview.property_address || "No property address"}</div>
                            <div>{caseItem.assisted_intake.case_overview.tenant_names || "No tenant names"}</div>
                            {caseItem.assisted_intake.contact?.phone ? (
                              <div>{caseItem.assisted_intake.contact.phone}</div>
                            ) : null}
                            {caseItem.assisted_intake.source_case_id ? (
                              <div>Imported from {caseItem.assisted_intake.source_case_id.slice(0, 8)}...</div>
                            ) : null}
                          </div>
                        )}
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
                        {caseItem.preview_document_count > 0 && (
                          <div className="mt-1 text-xs text-purple-700">
                            {caseItem.preview_document_count} preview doc{caseItem.preview_document_count === 1 ? "" : "s"}
                          </div>
                        )}
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
                        {caseItem.can_send_restart_link && (
                          <div className="mt-1 text-xs text-purple-700">Restart email available</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-charcoal">
                          {caseItem.recovery_last_event_at
                            ? `${recoveryStageLabel(caseItem.recovery_last_stage)} email`
                            : caseItem.can_send_restart_link
                            ? "Ready to send"
                            : "Not available"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {caseItem.recovery_last_event_at
                            ? formatDateTime(caseItem.recovery_last_event_at)
                            : caseItem.recovery_email || "No email"}
                        </div>
                        {caseItem.recovery_last_error && (
                          <div className="mt-1 max-w-[14rem] text-xs text-red-600">
                            {caseItem.recovery_last_error}
                          </div>
                        )}
                        {(caseItem.recovery_manual_sent_at ||
                          caseItem.recovery_day_1_sent_at ||
                          caseItem.recovery_day_7_sent_at) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {caseItem.recovery_manual_sent_at && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                                Manual
                              </span>
                            )}
                            {caseItem.recovery_day_1_sent_at && (
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                                Day 1
                              </span>
                            )}
                            {caseItem.recovery_day_7_sent_at && (
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                                Day 7
                              </span>
                            )}
                          </div>
                        )}
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
                          {caseItem.can_send_restart_link && (
                            <button onClick={() => openModal("restart", caseItem)} className="text-left font-semibold text-purple-700 hover:text-primary">
                              Send restart link
                            </button>
                          )}
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
                          {isAssistedPrepSku(caseItem.product_type) && caseItem.order_id && caseItem.payment_status === "paid" && (
                            <>
                              <button onClick={() => handleAssistedStatus(caseItem, "callback_booked")} className="text-left font-semibold text-primary hover:underline">
                                Mark callback booked
                              </button>
                              <button onClick={() => handleAssistedStatus(caseItem, "in_review")} className="text-left font-semibold text-primary hover:underline">
                                Mark in review
                              </button>
                              <button onClick={() => handleAssistedStatus(caseItem, "blocked_refund_due")} className="text-left font-semibold text-red-700 hover:underline">
                                Mark blocked/refund due
                              </button>
                              <button onClick={() => handleAssistedStatus(caseItem, "pack_prepared")} className="text-left font-semibold text-primary hover:underline">
                                Mark pack prepared
                              </button>
                              <button onClick={() => handleAssistedEmail(caseItem, "pack_ready")} className="text-left font-semibold text-green-700 hover:underline">
                                Send pack ready
                              </button>
                              <button onClick={() => handleAssistedStatus(caseItem, "completed")} className="text-left font-semibold text-primary hover:underline">
                                Mark completed
                              </button>
                              <button onClick={() => handleAssistedEmail(caseItem, "missing_information")} className="text-left font-semibold text-primary hover:underline">
                                Missing info email
                              </button>
                              <button onClick={() => handleAssistedEmail(caseItem, "blockers_action_summary")} className="text-left font-semibold text-red-700 hover:underline">
                                Blocker email
                              </button>
                              <button onClick={() => handleAssistedEmail(caseItem, "no_show_reschedule")} className="text-left font-semibold text-primary hover:underline">
                                No-show email
                              </button>
                              <button onClick={() => handleAssistedEmail(caseItem, "no_response_refund_offer")} className="text-left font-semibold text-amber-700 hover:underline">
                                7-day refund offer
                              </button>
                            </>
                          )}
                          {isAssistedPrepSku(caseItem.product_type) && caseItem.order_id && caseItem.payment_status === "refunded" && (
                            <button onClick={() => handleAssistedEmail(caseItem, "refund_processed")} className="text-left font-semibold text-primary hover:underline">
                              Send refund email
                            </button>
                          )}
                          {caseItem.can_reopen_edit_window && (
                            <button onClick={() => openModal("reopen", caseItem)} className="text-left font-semibold text-charcoal hover:text-primary">
                              Reopen edit window
                            </button>
                          )}
                          <button onClick={() => openModal("delete", caseItem)} className="text-left font-semibold text-red-700 hover:text-red-800">
                            Delete case
                          </button>
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
          confirmLabel={modalAction === "delete" ? "Delete permanently" : "Confirm"}
          variant={modalAction === "delete" ? "danger" : modalAction === "regenerate" ? "warning" : "default"}
          isLoading={actionLoading}
          confirmDisabled={modalAction === "delete" && deleteConfirmationText !== "DELETE"}
        />
      </Container>
    </div>
  );
}
