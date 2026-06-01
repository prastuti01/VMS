import { Mail, ReceiptText } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";
import { statusClass } from "../utils/statusClass";
import InvoiceList from "./InvoiceList";
import LineItemEditor from "./LineItemEditor";
import PanelHeader from "./PanelHeader";
import SummaryItem from "./SummaryItem";
import SalesInvoiceModal from "./SalesInvoiceModal";

function SalesInvoicePanel({
  form,
  setForm,
  parts,
  subtotal,
  customers,
  currentStaff,
  finalAmount,
  remaining,
  invoices,
  busy,
  onSubmit,
  onAddItem,
  onRemoveItem,
  onItemChange,
  onEmail,
  selectedSalesInvoice,
  setSelectedSalesInvoice,
}) {
  return (
    <div className="panel-grid">
      <section className="panel-card">
        <PanelHeader title="Sell Parts" meta={formatCurrency(remaining)} />
        <form className="invoice-form" onSubmit={onSubmit}>
          <div className="form-grid three">
            <label>
              Customer
              <select
                value={form.customerId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerId: event.target.value,
                  }))
                }
                required
              >
                <option value="">Select Customer</option>

                {customers?.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Staff
              <input value={currentStaff?.email || ""} disabled />
            </label>
            <label>
              Sale Date
              <input
                type="date"
                value={form.saleDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    saleDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <LineItemEditor
            parts={parts}
            items={form.items}
            onAdd={onAddItem}
            onRemove={onRemoveItem}
            onChange={onItemChange}
          />

          <div className="form-grid two">
            <label>
              Loyalty Discount
              <input
                value={subtotal > 5000 ? formatCurrency(subtotal * 0.1) : "$0"}
                disabled
              />
            </label>
            <label>
              Amount Paid
              <input
                value={form.amountPaid}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amountPaid: event.target.value,
                  }))
                }
                inputMode="decimal"
              />
            </label>
          </div>

          <div className="totals-bar">
            <SummaryItem label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryItem label="Final" value={formatCurrency(finalAmount)} />
            <SummaryItem label="Balance" value={formatCurrency(remaining)} />
          </div>

          <button className="primary-button full" type="submit" disabled={busy}>
            <ReceiptText size={19} />
            {busy ? "Creating" : "Create"}
          </button>
        </form>
      </section>

      <InvoiceList
        title="Sales Invoices"
        meta={`${invoices.length}`}
        emptyText="No records"
      >
        {invoices.map((invoice) => (
          <div
            className="invoice-row"
            onClick={() => setSelectedSalesInvoice(invoice)}
            key={invoice.saleId}
          >
            <div className="invoice-main">
              <span className="invoice-number">#{invoice.saleId}</span>
              <strong>
                {invoice.customerEmail || `Customer ${invoice.customerId}`}
              </strong>
              <small>{formatDate(invoice.saleDate)}</small>
            </div>
            <div className="invoice-side">
              <strong>{formatCurrency(invoice.finalAmount)}</strong>
              <span
                className={`status-pill ${statusClass(invoice.paymentStatus)}`}
              >
                {invoice.paymentStatus}
              </span>
              <button
                className="ghost-button compact"
                type="button"
                onClick={() => onEmail(invoice.saleId)}
              >
                <Mail size={17} />
                Email
              </button>
            </div>
          </div>
        ))}
      </InvoiceList>
      <SalesInvoiceModal
        invoice={selectedSalesInvoice}
        onClose={() => setSelectedSalesInvoice(null)}
      />
    </div>
  );
}

export default SalesInvoicePanel;
