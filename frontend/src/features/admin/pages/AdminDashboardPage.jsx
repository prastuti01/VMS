import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBullhorn, FaPaperPlane, FaPlus } from "react-icons/fa";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Topbar } from "../../../components/layout/Topbar";
import { Notice } from "../../../components/ui/Notice";
import { ReminderView } from "../../reminders/ReminderView";
import { StaffModal } from "../../staff/StaffModal";
import { StaffView } from "../../staff/StaffView";
import VendorManagement from "../../vendors/pages/VendorManagement";
import { AdminDashboardView } from "../components/AdminDashboardView";
import PartsManagement from "../../parts/pages/PartsManagement";
import InvoiceWorkspace from "../../invoices/InvoiceWorkspace";
import FinancialReport from "../../financialReport/pages/FinancialReport";
import {
  createStaffProfile,
  deleteStaffProfile,
  getAdminDashboard,
  getLowStockParts,
  getOverdueCredits,
  getStaffProfiles,
  sendCreditReminders,
  sendLowStockAlerts,
  updateStaffProfile,
} from "../services/adminService";
import { formatMoney } from "../../../utils/formatters";
import "../../../App.css";

const emptyDashboard = {
  generatedAt: null,
  totalCustomers: 0,
  totalStaff: 0,
  totalVendors: 0,
  totalParts: 0,
  lowStockPartCount: 0,
  pendingAppointmentCount: 0,
  pendingPartRequestCount: 0,
  overdueCreditCount: 0,
  overdueCreditAmount: 0,
  sales: { today: 0, thisMonth: 0, thisYear: 0 },
  purchases: { today: 0, thisMonth: 0, thisYear: 0 },
  lowStockParts: [],
  overdueCredits: [],
  recentSales: [],
};

function failedSections(results, labels) {
  return results
    .map((result, index) =>
      result.status === "rejected" ? labels[index] : null,
    )
    .filter(Boolean);
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function getReminderResultTone(result) {
  if (result?.sent > 0 && result?.skipped === 0) return "success";
  if (result?.sent > 0 || result?.skipped > 0 || result?.attempted === 0)
    return "warning";

  return "info";
}

function formatReminderResult(result, fallback) {
  const message = result?.message || fallback;

  if (
    typeof result?.sent !== "number" ||
    typeof result?.attempted !== "number"
  ) {
    return message;
  }

  if (result.attempted === 0 && !result.skipped) return message;

  const skippedText = result.skipped > 0 ? `, ${result.skipped} skipped` : "";
  return `${message} ${result.sent}/${result.attempted} sent${skippedText}.`;
}

export default function AdminDashboardPage() {
  const [activeView, setActiveViewRaw] = useState("dashboard");
  const setActiveView = (view) => {
    setActiveViewRaw(view);
    setQuery("");
  };
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("info");
  const [isLoading, setIsLoading] = useState(true);
  const [staffModal, setStaffModal] = useState(null);
  const [staffError, setStaffError] = useState("");
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [lowStockParts, setLowStockParts] = useState([]);
  const [overdueCredits, setOverdueCredits] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [busyReminder, setBusyReminder] = useState("");

  // Refs to call openAddModal inside child pages from the topbar button
  const openAddPartRef = useRef(null);
  const openAddVendorRef = useRef(null);

  const visibleStaff = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle || activeView !== "staff") return staffMembers;
    return staffMembers.filter((member) =>
      [
        member.email,
        member.phoneNumber,
        member.position,
        member.roles?.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [activeView, query, staffMembers]);

  const visibleLowStock = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle || activeView !== "reminders") return lowStockParts;
    return lowStockParts.filter((part) =>
      [part.name, part.category, part.vendorName, part.vendorEmail]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [activeView, lowStockParts, query]);

  const visibleCredits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle || activeView !== "reminders") return overdueCredits;
    return overdueCredits.filter((credit) =>
      [credit.saleId, credit.customerEmail, credit.customerPhone]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [activeView, overdueCredits, query]);

  const notifications = useMemo(() => {
    const stockNotifications = lowStockParts.map((part) => ({
      id: `low-stock-${part.partId}`,
      tone: part.stockQuantity === 0 ? "error" : "warning",
      title: part.stockQuantity === 0 ? "Part out of stock" : "Low stock part",
      detail: `${part.name} has ${part.stockQuantity} unit(s) left.`,
      meta: part.vendorName
        ? `Vendor: ${part.vendorName}`
        : `Threshold: ${part.reorderThreshold}`,
      search: part.name,
    }));

    const creditNotifications = overdueCredits.map((credit) => ({
      id: `overdue-credit-${credit.saleId}`,
      tone: "error",
      title: "Overdue credit",
      detail: `Invoice #${credit.saleId} has ${formatMoney(
        credit.remainingBalance,
      )} remaining.`,
      meta: `${credit.daysOverdue} days overdue`,
      search: String(credit.saleId),
    }));

    return [...stockNotifications, ...creditNotifications];
  }, [lowStockParts, overdueCredits]);

  function handleNotificationSelect(notification) {
    setActiveViewRaw("reminders");
    setQuery(notification.search || "");
  }

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("");
    setStatusTone("info");

    const labels = [
      "dashboard",
      "low stock reminders",
      "credit reminders",
      "staff",
    ];
    const results = await Promise.allSettled([
      getAdminDashboard(),
      getLowStockParts(),
      getOverdueCredits(),
      getStaffProfiles(),
    ]);
    const [dashboardResult, lowStockResult, creditResult, staffResult] =
      results;

    if (dashboardResult.status === "fulfilled") {
      setDashboard({ ...emptyDashboard, ...dashboardResult.value });
    }
    if (lowStockResult.status === "fulfilled")
      setLowStockParts(lowStockResult.value);
    if (creditResult.status === "fulfilled")
      setOverdueCredits(creditResult.value);
    if (staffResult.status === "fulfilled") setStaffMembers(staffResult.value);

    const failed = failedSections(results, labels);
    if (failed.length > 0) {
      setStatusTone("error");
      setStatusMessage(
        `Could not load ${failed.join(", ")}. Check backend connection and admin login.`,
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadWorkspace, 0);
    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);

  async function handleSendLowStock() {
    if (busyReminder) return;

    setBusyReminder("low-stock");
    setStatusTone("info");
    setStatusMessage("Sending low-stock alerts...");

    try {
      const result = await sendLowStockAlerts();

      setStatusTone(getReminderResultTone(result));
      setStatusMessage(formatReminderResult(result, "Low-stock alerts sent."));

      try {
        const updatedParts = await getLowStockParts();
        setLowStockParts(updatedParts);
      } catch {
        // The send result is the important feedback here; the next load will refresh the list.
      }
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(
        getErrorMessage(error, "Low-stock alert could not be sent."),
      );
    } finally {
      setBusyReminder("");
    }
  }

  async function handleSendCredits() {
    if (busyReminder) return;

    setBusyReminder("credits");
    setStatusTone("info");
    setStatusMessage("Sending credit reminders...");

    try {
      const result = await sendCreditReminders();

      setStatusTone(getReminderResultTone(result));
      setStatusMessage(formatReminderResult(result, "Credit reminders sent."));

      try {
        const updatedCredits = await getOverdueCredits();
        setOverdueCredits(updatedCredits);
      } catch {
        // The send result is the important feedback here; the next load will refresh the list.
      }
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(
        getErrorMessage(error, "Credit reminders could not be sent."),
      );
    } finally {
      setBusyReminder("");
    }
  }

  async function handleSaveStaff(form) {
    const isEditing = Boolean(form.staffId);
    const payload = {
      email: form.email,
      phoneNumber: form.phoneNumber,
      position: form.position,
      salary: Number(form.salary),
      joinedDate: form.joinedDate,
      role: form.role,
      ...(!isEditing && { password: form.password }),
    };

    setIsSavingStaff(true);
    setStaffError("");

    try {
      const saved = isEditing
        ? await updateStaffProfile(form.staffId, payload)
        : await createStaffProfile(payload);

      setStaffMembers((current) =>
        isEditing
          ? current.map((member) =>
              member.staffId === saved.staffId ? saved : member,
            )
          : [saved, ...current],
      );
      setStatusTone("info");
      setStatusMessage(
        isEditing ? "Staff profile updated." : "Staff profile created.",
      );
      setStaffModal(null);
    } catch (error) {
      setStaffError(
        getErrorMessage(error, "Staff profile could not be saved."),
      );
    } finally {
      setIsSavingStaff(false);
    }
  }

  async function handleDeleteStaff(staffId) {
    try {
      await deleteStaffProfile(staffId);
      setStaffMembers((current) =>
        current.filter((member) => member.staffId !== staffId),
      );
      setStatusTone("info");
      setStatusMessage("Staff profile deleted.");
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(
        getErrorMessage(error, "Staff profile could not be deleted."),
      );
    }
  }

  const topbarAction =
    activeView === "staff"
      ? {
          label: "Add Staff",
          icon: FaPlus,
          onClick: () => {
            setStaffError("");
            setStaffModal({});
          },
        }
      : activeView === "parts"
        ? {
            label: "Add Part",
            icon: FaPlus,
            onClick: () => openAddPartRef.current?.(),
          }
        : activeView === "vendors"
          ? {
              label: "Add Vendor",
              icon: FaPlus,
              onClick: () => openAddVendorRef.current?.(),
            }
          : activeView === "reminders"
            ? {
                label: busyReminder ? "Sending..." : "Send Reminders",
                icon: FaPaperPlane,
                disabled: Boolean(busyReminder),
                menuItems: [
                  {
                    label:
                      busyReminder === "low-stock"
                        ? "Sending Low Stock Alert"
                        : "Send Low Stock Alert",
                    icon: FaBullhorn,
                    disabled: Boolean(busyReminder),
                    onClick: handleSendLowStock,
                  },
                  {
                    label:
                      busyReminder === "credits"
                        ? "Sending Credit Reminders"
                        : "Send Credit Reminders",
                    icon: FaPaperPlane,
                    disabled: Boolean(busyReminder),
                    onClick: handleSendCredits,
                  },
                ],
              }
            : null;

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="workspace">
        <Topbar
          activeView={activeView}
          query={query}
          onQueryChange={setQuery}
          action={topbarAction}
          notifications={notifications}
          onNotificationSelect={handleNotificationSelect}
          showSearch={
            activeView !== "dashboard" && activeView !== "purchaseInvoices"
          }
        />

        <section className="content-area">
          {statusMessage && (
            <Notice
              icon={FaBullhorn}
              tone={statusTone}
              onDismiss={() => setStatusMessage("")}
            >
              {statusMessage}
            </Notice>
          )}

          {activeView === "dashboard" && (
            <AdminDashboardView
              dashboard={{
                ...dashboard,
                lowStockPartCount: lowStockParts.length,
                overdueCreditCount: overdueCredits.length,
                overdueCreditAmount: overdueCredits.reduce(
                  (total, credit) => total + credit.remainingBalance,
                  0,
                ),
              }}
              lowStockParts={lowStockParts}
              overdueCredits={overdueCredits}
              isLoading={isLoading}
            />
          )}

          {activeView === "staff" && (
            <StaffView
              staffMembers={visibleStaff}
              onEdit={(staff) => {
                setStaffError("");
                setStaffModal(staff);
              }}
              onDelete={handleDeleteStaff}
            />
          )}

          {activeView === "vendors" && (
            <VendorManagement
              query={query}
              onRegisterOpen={(fn) => {
                openAddVendorRef.current = fn;
              }}
            />
          )}

          {activeView === "parts" && (
            <PartsManagement
              query={query}
              onRegisterOpen={(fn) => {
                openAddPartRef.current = fn;
              }}
            />
          )}

          {activeView === "purchaseInvoices" && (
            <InvoiceWorkspace mode="purchase" />
          )}

          {activeView === "financialReport" && <FinancialReport />}
          {activeView === "reminders" && (
            <ReminderView
              lowStockParts={visibleLowStock}
              overdueCredits={visibleCredits}
            />
          )}
        </section>
      </main>

      {staffModal && (
        <StaffModal
          staff={staffModal}
          errorMessage={staffError}
          isSaving={isSavingStaff}
          onClose={() => setStaffModal(null)}
          onSave={handleSaveStaff}
        />
      )}
    </div>
  );
}
