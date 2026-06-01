import { Mail, PackagePlus, ReceiptText, ShoppingCart } from "lucide-react";
import EmailInvoicePanel from "./components/EmailInvoicePanel";
import InvoiceToolbar from "./components/InvoiceToolbar";
import Notice from "./components/Notice";
import PurchaseInvoicePanel from "./components/PurchaseInvoicePanel";
import SalesInvoicePanel from "./components/SalesInvoicePanel";
import StatCard from "./components/StatCard";
import WorkspaceTabs from "./components/WorkspaceTabs";
import { PANEL_KEYS } from "./constants";
import { useInvoiceWorkspace } from "./hooks/useInvoiceWorkspace";

import "./invoice-workspace.css";

function InvoiceWorkspace({ mode }) {
  const invoice = useInvoiceWorkspace(mode);

  return (
    <section className="invoice-workspace">
      {invoice.notice && (
        <Notice
          type={invoice.notice.type}
          message={invoice.notice.message}
          onDismiss={() => invoice.setNotice(null)}
        />
      )}

      <WorkspaceTabs
        mode={mode}
        activePanel={invoice.activePanel}
        onChange={invoice.setActivePanel}
      />

      {invoice.activePanel === PANEL_KEYS.PURCHASE && (
        <PurchaseInvoicePanel
          form={invoice.purchaseForm}
          setForm={invoice.setPurchaseForm}
          vendors={invoice.vendors}
          parts={invoice.parts}
          total={invoice.purchaseTotal}
          invoices={invoice.filteredPurchaseInvoices}
          busy={invoice.busyAction === "purchase"}
          onSubmit={invoice.handlePurchaseSubmit}
          onAddItem={invoice.addPurchaseItem}
          onRemoveItem={invoice.removePurchaseItem}
          onItemChange={invoice.handlePurchaseItemChange}
        />
      )}

      {invoice.activePanel === PANEL_KEYS.SALES && (
        <SalesInvoicePanel
          form={invoice.salesForm}
          setForm={invoice.setSalesForm}
          subtotal={invoice.salesSubtotal}
          finalAmount={invoice.salesFinalAmount}
          remaining={invoice.salesRemaining}
          invoices={invoice.filteredSalesInvoices}
          busy={invoice.busyAction === "sales"}
          onSubmit={invoice.handleSalesSubmit}
          onAddItem={invoice.addSalesItem}
          onRemoveItem={invoice.removeSalesItem}
          onItemChange={invoice.handleSalesItemChange}
          onEmail={invoice.openEmailPanel}
          customers={invoice.customers}
          currentStaff={invoice.currentStaff}
          parts={invoice.parts}
          selectedSalesInvoice={invoice.selectedSalesInvoice}
          setSelectedSalesInvoice={invoice.setSelectedSalesInvoice}
        />
      )}

      {invoice.activePanel === PANEL_KEYS.EMAIL && (
        <EmailInvoicePanel
          invoices={invoice.filteredSalesInvoices}
          selectedInvoice={invoice.selectedEmailInvoice}
          emailSaleId={invoice.emailSaleId}
          setEmailSaleId={invoice.setEmailSaleId}
          busyAction={invoice.busyAction}
          onEmail={invoice.handleEmailInvoice}
        />
      )}
    </section>
  );
}

export default InvoiceWorkspace;
