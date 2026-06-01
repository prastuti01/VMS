import {
  FaBoxes,
  FaClipboardList,
  FaCreditCard,
  FaDollarSign,
  FaExclamationTriangle,
  FaUsers,
  FaWarehouse,
} from "react-icons/fa";
import { MetricCard } from "../../../components/ui/MetricCard";
import { Notice } from "../../../components/ui/Notice";
import { PanelHeader } from "../../../components/ui/PanelHeader";
import { SnapshotItem } from "../../../components/ui/SnapshotItem";
import { StatusPill } from "../../../components/ui/StatusPill";
import { CreditTable } from "../../reminders/CreditTable";
import { StockTable } from "../../reminders/StockTable";
import {
  formatDateTime,
  formatMoney,
  formatNumber,
} from "../../../utils/formatters";

export function AdminDashboardView({
  dashboard,
  lowStockParts,
  overdueCredits,
  isLoading,
}) {
  const metrics = [
    {
      label: "Total Parts",
      value: formatNumber(dashboard.totalParts),
      icon: FaBoxes,
      tone: "info",
    },
    {
      label: "Staff Profiles",
      value: formatNumber(dashboard.totalStaff),
      icon: FaUsers,
      tone: "indigo",
    },
    {
      label: "Low Stock Items",
      value: formatNumber(dashboard.lowStockPartCount),
      icon: FaExclamationTriangle,
      tone: "warning",
    },
    {
      label: "Overdue Credits",
      value: formatMoney(dashboard.overdueCreditAmount),
      icon: FaCreditCard,
      tone: "error",
    },
  ];

  return (
    <>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {dashboard.lowStockPartCount > 0 && (
        <Notice icon={FaExclamationTriangle} tone="warning">
          Low stock alert: {dashboard.lowStockPartCount} parts
        </Notice>
      )}

      <div className="dashboard-grid">
        <section className="panel">
          <PanelHeader
            title="Business Snapshot"
            action={formatDateTime(dashboard.generatedAt)}
          />
          <div className="snapshot-grid">
            <SnapshotItem
              label="Sales Today"
              value={formatMoney(dashboard.sales?.today)}
              icon={FaDollarSign}
              tone="success"
            />
            <SnapshotItem
              label="Sales This Month"
              value={formatMoney(dashboard.sales?.thisMonth)}
              icon={FaDollarSign}
              tone="info"
            />
            <SnapshotItem
              label="Purchases This Month"
              value={formatMoney(dashboard.purchases?.thisMonth)}
              icon={FaWarehouse}
              tone="purple"
            />
            <SnapshotItem
              label="Pending Requests"
              value={formatNumber(dashboard.pendingPartRequestCount)}
              icon={FaClipboardList}
              tone="warning"
            />
          </div>
        </section>

        <section className="panel">
          <PanelHeader title="Recent Sales" />
          <div className="compact-list">
            {(dashboard.recentSales || []).map((sale) => (
              <div className="compact-row" key={sale.saleId}>
                <div>
                  <strong>Invoice #{sale.saleId}</strong>
                  <span>{sale.customerEmail}</span>
                </div>
                <div className="align-right">
                  <strong>{formatMoney(sale.finalAmount)}</strong>
                  <StatusPill status={sale.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-grid">
        <StockTable parts={lowStockParts.slice(0, 4)} isCompact />
        <CreditTable credits={overdueCredits.slice(0, 4)} isCompact />
      </div>

      {isLoading && <div className="loading-bar" />}
    </>
  );
}
