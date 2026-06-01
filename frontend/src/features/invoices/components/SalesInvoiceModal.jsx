import { X } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";

function SalesInvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal">
        <div className="invoice-modal-header">
          <div>
            <span className="invoice-number">#{invoice.saleId}</span>

            <h2>{invoice.customerEmail || `Customer ${invoice.customerId}`}</h2>

            <small>{formatDate(invoice.saleDate)}</small>
          </div>

          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="invoice-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items?.map((item) => (
                <tr key={item.salesItemId}>
                  <td>{item.partName}</td>

                  <td>{item.category}</td>

                  <td>{item.quantity}</td>

                  <td>{formatCurrency(item.unitPrice)}</td>

                  <td>{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sales-summary-table">
          <table>
            <tbody>
              <tr className="summary-total">
                <td>Total Amount</td>
                <td>{formatCurrency(invoice.totalAmount)}</td>
              </tr>

              <tr className="summary-discount">
                <td>Discount</td>
                <td>{formatCurrency(invoice.discount)}</td>
              </tr>

              <tr className="summary-final">
                <td>Final Amount</td>
                <td>{formatCurrency(invoice.finalAmount)}</td>
              </tr>

              <tr className="summary-paid">
                <td>Amount Paid</td>
                <td>{formatCurrency(invoice.amountPaid)}</td>
              </tr>

              <tr className="summary-remaining">
                <td>Remaining Balance</td>
                <td>{formatCurrency(invoice.remainingBalance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SalesInvoiceModal;
