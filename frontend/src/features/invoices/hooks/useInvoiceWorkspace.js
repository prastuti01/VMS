import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getApiErrorMessage,
  purchaseInvoiceApi,
  salesInvoiceApi,
  vendorApi,
  getParts,
  getCustomers,
} from "../../../shared/config/api";
import { emptyPurchaseItem, emptySalesItem, PANEL_KEYS } from "../constants";
import { toNumber } from "../utils/formatters";

export function useInvoiceWorkspace(mode) {
  const [activePanel, setActivePanel] = useState(
  mode === "purchase"
    ? PANEL_KEYS.PURCHASE
    : PANEL_KEYS.SALES
);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [emailSaleId, setEmailSaleId] = useState("");
  const [selectedSalesInvoice, setSelectedSalesInvoice] =
  useState(null);
  const [purchaseForm, setPurchaseForm] = useState({
    vendorId: "",
    purchaseDate: "",
    items: [{ ...emptyPurchaseItem }],
  });

  const [salesForm, setSalesForm] = useState({
    customerId: "",
    staffId: "",
    saleDate: "",
    discount: 0,
    amountPaid: 0,
    items: [{ ...emptySalesItem }],
  });
  const currentStaff =
  JSON.parse(localStorage.getItem("user"));
  const purchaseTotal = useMemo(
    () =>
      purchaseForm.items.reduce(
        (total, item) => total + toNumber(item.quantity) * toNumber(item.unitPrice),
        0,
      ),
    [purchaseForm.items],
  );

  const salesSubtotal = useMemo(
    () =>
      salesForm.items.reduce(
        (total, item) => total + toNumber(item.quantity) * toNumber(item.unitPrice),
        0,
      ),
    [salesForm.items],
  );

  const salesFinalAmount = Math.max(salesSubtotal - toNumber(salesForm.discount), 0);
  const salesRemaining = Math.max(salesFinalAmount - toNumber(salesForm.amountPaid), 0);

  const metrics = useMemo(() => {
    const salesTotal = salesInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.finalAmount),
      0,
    );
    const creditDue = salesInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.remainingBalance),
      0,
    );
    const purchaseTotalAmount = purchaseInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.totalAmount),
      0,
    );

    return {
      purchaseTotalAmount,
      salesCount: salesInvoices.length,
      salesTotal,
      creditDue,
    };
  }, [purchaseInvoices, salesInvoices]);

  const filteredPurchaseInvoices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return purchaseInvoices;

    return purchaseInvoices.filter((invoice) =>
      [invoice.purchaseId, invoice.vendorId, invoice.vendorName, invoice.totalAmount]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [purchaseInvoices, searchTerm]);

  const filteredSalesInvoices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return salesInvoices;

    return salesInvoices.filter((invoice) =>
      [
        invoice.saleId,
        invoice.customerId,
        invoice.customerEmail,
        invoice.paymentStatus,
        invoice.finalAmount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [salesInvoices, searchTerm]);

  const selectedEmailInvoice = useMemo(
    () => salesInvoices.find((invoice) => String(invoice.saleId) === String(emailSaleId)),
    [emailSaleId, salesInvoices],
  );

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      let vendorResult = null;
      let purchaseResult = null;
      let salesResult = null;
      let partResult = null;
      let customersResult = null;


if (mode === "purchase") {
  [vendorResult, partResult, purchaseResult] =
    await Promise.allSettled([
      vendorApi.list(),
      getParts(),
      purchaseInvoiceApi.list(),
    ]);
}

if (mode === "sales") {
  [partResult, salesResult, customersResult] =
    await Promise.allSettled([
      getParts(),
      salesInvoiceApi.list(),
      getCustomers(),
    ]);
}


if (vendorResult && vendorResult.status === "fulfilled") {
  setVendors(vendorResult.value);
}

if (partResult && partResult.status === "fulfilled") {
  console.log(partResult.value);
  setParts(partResult.value.data);
}
      

if (purchaseResult && purchaseResult.status === "fulfilled") {
  setPurchaseInvoices(purchaseResult.value);
}

if (salesResult && salesResult.status === "fulfilled") {
  setSalesInvoices(salesResult.value);

  if (salesResult.value.length > 0) {
    setEmailSaleId(
      (current) => current || String(salesResult.value[0].saleId),
    );
  }
}
 if (customersResult && customersResult.status === "fulfilled") {
  setCustomers(customersResult.value.data);
}     
      

const rejected = [
  vendorResult,
  partResult,
  purchaseResult,
  salesResult,
]
  .filter(Boolean)
  .find((result) => result.status === "rejected");
      if (rejected) {
        showNotice("warning", getApiErrorMessage(rejected.reason));
      }
    } finally {
      setLoading(false);
    }
  }, [mode, showNotice]);

  useEffect(() => {
    const initializeDashboard = async () => {
      await loadDashboardData();
    };

    void initializeDashboard();
  }, [loadDashboardData]);

  const handlePurchaseItemChange = (index, field, value) => {
    setPurchaseForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSalesItemChange = (index, field, value) => {
    setSalesForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addPurchaseItem = () => {
    setPurchaseForm((current) => ({
      ...current,
      items: [...current.items, { ...emptyPurchaseItem }],
    }));
  };

  const addSalesItem = () => {
    setSalesForm((current) => ({
      ...current,
      items: [...current.items, { ...emptySalesItem }],
    }));
  };

  const removePurchaseItem = (index) => {
    setPurchaseForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const removeSalesItem = (index) => {
    setSalesForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handlePurchaseSubmit = async (event) => {
    event.preventDefault();
    setBusyAction("purchase");

    const payload = {
      vendorId: Number(purchaseForm.vendorId),
      purchaseDate: purchaseForm.purchaseDate || null,
      items: purchaseForm.items.map((item) => ({
        partId: Number(item.partId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    try {
      const invoice = await purchaseInvoiceApi.create(payload);
      setPurchaseInvoices((current) => [invoice, ...current]);
      setPurchaseForm({ vendorId: "", purchaseDate: "", items: [{ ...emptyPurchaseItem }] });
      showNotice("success", `Purchase invoice #${invoice.purchaseId} created.`);
    } catch (error) {
      showNotice("error", getApiErrorMessage(error));
    } finally {
      setBusyAction("");
    }
  };

  const handleSalesSubmit = async (event) => {
    event.preventDefault();
    setBusyAction("sales");

    const payload = {
      customerId: Number(salesForm.customerId),
      staffId: salesForm.staffId ? Number(salesForm.staffId) : null,
      saleDate: salesForm.saleDate || null,
      discount: 0,
      amountPaid: Number(salesForm.amountPaid || 0),
      items: salesForm.items.map((item) => ({
        partId: Number(item.partId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    try {
      const invoice = await salesInvoiceApi.create(payload);
      setSalesInvoices((current) => [invoice, ...current]);
      setEmailSaleId(String(invoice.saleId));
      setSalesForm({
        customerId: "",
        staffId: "",
        saleDate: "",
        discount: 0,
        amountPaid: 0,
        items: [{ ...emptySalesItem }],
      });
      showNotice("success", `Sales invoice #${invoice.saleId} created.`);
    } catch (error) {
      showNotice("error", getApiErrorMessage(error));
    } finally {
      setBusyAction("");
    }
  };

  const handleEmailInvoice = async (saleId = emailSaleId) => {
    if (!saleId) {
      showNotice("warning", "Select a sales invoice.");
      return;
    }

    setBusyAction(`email-${saleId}`);
    try {
      const result = await salesInvoiceApi.email(saleId);
      showNotice("success", result.message || `Invoice #${saleId} emailed.`);
    } catch (error) {
      showNotice("error", getApiErrorMessage(error));
    } finally {
      setBusyAction("");
    }
  };

  const openEmailPanel = (saleId) => {
    setEmailSaleId(String(saleId));
    setActivePanel(PANEL_KEYS.EMAIL);
  };

  return {
    activePanel,
    setActivePanel,
    searchTerm,
    setSearchTerm,
    vendors,
    parts,
    loading,
    busyAction,
    notice,
    setNotice,
    emailSaleId,
    setEmailSaleId,
    purchaseForm,
    setPurchaseForm,
    salesForm,
    setSalesForm,
    purchaseTotal,
    salesSubtotal,
    salesFinalAmount,
    salesRemaining,
    metrics,
    filteredPurchaseInvoices,
    filteredSalesInvoices,
    selectedEmailInvoice,
    loadDashboardData,
    handlePurchaseItemChange,
    handleSalesItemChange,
    addPurchaseItem,
    addSalesItem,
    removePurchaseItem,
    removeSalesItem,
    handlePurchaseSubmit,
    handleSalesSubmit,
    handleEmailInvoice,
    openEmailPanel,
    customers,
    currentStaff,
    selectedSalesInvoice,
    setSelectedSalesInvoice,
  };
}
