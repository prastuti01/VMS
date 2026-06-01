import { X } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";

function PurchaseInvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal">
        <div className="invoice-modal-header">
          <div>
            <span className="invoice-number">#{invoice.purchaseId}</span>

            <h2>{invoice.vendorName || `Vendor ${invoice.vendorId}`}</h2>

            <small>{formatDate(invoice.purchaseDate)}</small>
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
                <tr key={item.purchaseItemId}>
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

        <div className="invoice-modal-total">
          <span>Grand Total</span>

          <strong>{formatCurrency(invoice.totalAmount)}</strong>
        </div>
      </div>
    </div>
  );
}

export default PurchaseInvoiceModal;