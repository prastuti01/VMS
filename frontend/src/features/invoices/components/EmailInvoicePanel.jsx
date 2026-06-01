import { ChevronRight, Send } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";
import { statusClass } from "../utils/statusClass";
import InvoiceList from "./InvoiceList";
import PanelHeader from "./PanelHeader";
import SummaryItem from "./SummaryItem";

function EmailInvoicePanel({
  invoices,
  selectedInvoice,
  emailSaleId,
  setEmailSaleId,
  busyAction,
  onEmail,
}) {
  return (
    <div className="panel-grid email-layout">
      <section className="panel-card">
        <PanelHeader title="Email Invoice" />
        <div className="email-picker">
          <label>
            Sales Invoice
            <select
              value={emailSaleId}
              onChange={(event) => setEmailSaleId(event.target.value)}
            >
              <option value="">Select</option>
              {invoices.map((invoice) => (
                <option key={invoice.saleId} value={invoice.saleId}>
                  #{invoice.saleId} -{" "}
                  {invoice.customerEmail || `Customer ${invoice.customerId}`}
                </option>
              ))}
            </select>
          </label>
          <button
            className="primary-button"
            type="button"
            onClick={() => onEmail(emailSaleId)}
            disabled={!emailSaleId || busyAction === `email-${emailSaleId}`}
          >
            <Send size={19} />
            {busyAction === `email-${emailSaleId}` ? "Sending" : "Send"}
          </button>
        </div>

        <div className="invoice-preview">
         

          {selectedInvoice ? (
            <div className="email-preview-card">
              <div className="email-preview-header">
                <div>
                  <span className="invoice-number">
                    #{selectedInvoice.saleId}
                  </span>

                  <h3>{selectedInvoice.customerEmail}</h3>

                  <small>{formatDate(selectedInvoice.saleDate)}</small>
                </div>

                <span
                  className={`status-pill ${statusClass(
                    selectedInvoice.paymentStatus,
                  )}`}
                >
                  {selectedInvoice.paymentStatus}
                </span>
              </div>

              <div className="email-preview-section">
                <table className="email-preview-items">
                  <thead>
                    <tr>
                      <th>Part</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedInvoice.items?.map((item) => (
                      <tr key={item.salesItemId || item.partId}>
                        <td>{item.partName || `Part ${item.partId}`}</td>

                        <td>{item.quantity}</td>

                        <td>{formatCurrency(item.unitPrice)}</td>

                        <td>
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="email-summary-table">
                <table>
                  <tbody>
                    <tr>
                      <td>Final Amount</td>
                      <td>{formatCurrency(selectedInvoice.finalAmount)}</td>
                    </tr>

                    <tr>
                      <td>Amount Paid</td>
                      <td>{formatCurrency(selectedInvoice.amountPaid)}</td>
                    </tr>

                    <tr>
                      <td>Remaining Balance</td>
                      <td>
                        {formatCurrency(selectedInvoice.remainingBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <InvoiceList
        title="Sales Invoices"
        meta={`${invoices.length}`}
        emptyText="No records"
      >
        {invoices.map((invoice) => (
          <button
            className="email-row"
            key={invoice.saleId}
            type="button"
            onClick={() => setEmailSaleId(String(invoice.saleId))}
          >
            <span className="invoice-number">#{invoice.saleId}</span>
            <strong>
              {invoice.customerEmail || `Customer ${invoice.customerId}`}
            </strong>
            <small>{formatCurrency(invoice.finalAmount)}</small>
            <ChevronRight size={18} />
          </button>
        ))}
      </InvoiceList>
    </div>
  );
}

export default EmailInvoicePanel;
