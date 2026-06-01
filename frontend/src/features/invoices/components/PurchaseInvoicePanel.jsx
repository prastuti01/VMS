import { FilePlus2 } from "lucide-react";
import { useMemo, useState } from "react";

import { formatCurrency, formatDate } from "../utils/formatters";

import InvoiceList from "./InvoiceList";
import LineItemEditor from "./LineItemEditor";
import PanelHeader from "./PanelHeader";
import PurchaseInvoiceModal from "./PurchaseInvoiceModal";

function PurchaseInvoicePanel({
  form,
  setForm,
  vendors,
  parts,
  total,
  invoices,
  busy,
  onSubmit,
  onAddItem,
  onRemoveItem,
  onItemChange,
}) {
  const [selectedVendor, setSelectedVendor] = useState("All Vendors");

  const [dateFilter, setDateFilter] = useState("All Time");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const vendorOptions = [
    "All Vendors",
    ...new Set(invoices.map((invoice) => invoice.vendorName)),
  ];

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.purchaseDate);

      const matchesVendor =
        selectedVendor === "All Vendors" ||
        invoice.vendorName === selectedVendor;

      let matchesDate = true;

      const today = new Date();

      if (dateFilter === "Today") {
        matchesDate = invoiceDate.toDateString() === today.toDateString();
      }

      if (dateFilter === "Past 7 Days") {
        const last7Days = new Date();

        last7Days.setDate(today.getDate() - 7);

        matchesDate = invoiceDate >= last7Days;
      }

      if (dateFilter === "This Month") {
        matchesDate =
          invoiceDate.getMonth() === today.getMonth() &&
          invoiceDate.getFullYear() === today.getFullYear();
      }

      if (dateFilter === "Custom") {
        const from = fromDate ? new Date(fromDate) : null;

        const to = toDate ? new Date(toDate) : null;

        if (from && to) {
          matchesDate = invoiceDate >= from && invoiceDate <= to;
        }
      }

      return matchesVendor && matchesDate;
    });
  }, [invoices, selectedVendor, dateFilter, fromDate, toDate]);

  return (
    <div className="panel-grid">
      <section className="panel-card">
        <PanelHeader
          title="Create Purchase Invoice"
          meta={`${form.items.length} item${
            form.items.length === 1 ? "" : "s"
          }`}
        />

        <form className="invoice-form" onSubmit={onSubmit}>
          <div className="form-grid two">
            <label>
              Vendor
              <select
                value={form.vendorId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    vendorId: event.target.value,
                  }))
                }
                required
              >
                <option value="">Select</option>

                {vendors.map((vendor) => (
                  <option key={vendor.vendorId} value={vendor.vendorId}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Purchase Date
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    purchaseDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <LineItemEditor
            items={form.items}
            parts={parts}
            onAdd={onAddItem}
            onRemove={onRemoveItem}
            onChange={onItemChange}
          />

          <div className="invoice-summary">
            <span>Total</span>

            <strong>{formatCurrency(total)}</strong>
          </div>

          <button className="primary-button full" type="submit" disabled={busy}>
            <FilePlus2 size={19} />

            {busy ? "Creating" : "Create"}
          </button>
        </form>
      </section>

      <InvoiceList
        title="Purchase Invoices"
        meta={`${filteredInvoices.length}`}
        emptyText="No records"
        filters={
          <>
            <div className="invoice-filters">
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
              >
                {vendorOptions.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option>All Time</option>

                <option>Today</option>

                <option>Past 7 Days</option>

                <option>This Month</option>

                <option>Custom</option>
              </select>
            </div>

            {dateFilter === "Custom" && (
              <div className="custom-date-range">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            )}
          </>
        }
      >
        {filteredInvoices.map((invoice) => (
          <div
            className="invoice-row"
            key={invoice.purchaseId}
            onClick={() => setSelectedInvoice(invoice)}
          >
            <div className="invoice-main">
              <span className="invoice-number">#{invoice.purchaseId}</span>

              <strong>
                {invoice.vendorName || `Vendor ${invoice.vendorId}`}
              </strong>

              <small>{formatDate(invoice.purchaseDate)}</small>
            </div>

            <div className="invoice-side">
              <strong>{formatCurrency(invoice.totalAmount)}</strong>

              <span className="status-pill info">
                {invoice.items?.length || 0} items
              </span>
            </div>
          </div>
        ))}
      </InvoiceList>

      {selectedInvoice && (
        <PurchaseInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

export default PurchaseInvoicePanel;
