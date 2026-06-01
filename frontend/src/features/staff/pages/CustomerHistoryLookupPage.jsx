import { useState } from "react";
import { searchCustomers } from "../../../shared/config/api";
import { getCustomerHistoryById } from "../../customers/services/customerService";

export default function CustomerHistoryLookupPage() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchError("Please enter email, phone, or customer ID.");
      return;
    }
    try {
      setSearchLoading(true);
      setHistory(null);
      setCustomers([]);
      setSelectedCustomer(null);
      setSearchError("");
      const res = await searchCustomers(query);
      if (!res.data || res.data.length === 0) {
        setSearchError("No customer found.");
        return;
      }
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
      setSearchError("Failed to search customer.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCustomerSelect = async (customer) => {
    try {
      setLoading(true);
      setSelectedCustomer(customer);
      setCustomers([]);
      setQuery("");
      setSearchError("");
      const res = await getCustomerHistoryById(customer.customerId);
      setHistory(res.data);
    } catch (err) {
      console.log(err);
      setSearchError("Failed to load customer history.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCustomer(null);
    setHistory(null);
    setQuery("");
    setSearchError("");
    setCustomers([]);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return { bg: "#dcfce7", text: "#166534" };
      case "partial":
      case "pending":
        return { bg: "#fef3c7", text: "#92400e" };
      case "cancelled":
      case "unpaid":
        return { bg: "#fee2e2", text: "#b91c1c" };
      default:
        return { bg: "#e5e7eb", text: "#374151" };
    }
  };

  return (
    <div style={styles.content}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Customer Purchase & Service History</h1>
        <p style={styles.subtitle}>
          Search and view customer history, purchases, payments, and services.
        </p>
      </div>

      {/* SEARCH */}
      <section style={styles.searchSection}>
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="Search customer by email, phone, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button onClick={handleSearch} style={styles.searchBtn}>
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {searchError && <div style={styles.errorBox}>{searchError}</div>}

        {/* SEARCH RESULTS */}
        {customers.length > 0 && (
          <div style={styles.customerList}>
            {customers.map((customer) => (
              <div key={customer.customerId} style={styles.customerCard}>
                <div>
                  <div style={styles.customerEmail}>{customer.email}</div>
                  <div style={styles.customerMeta}>
                    {customer.phone}
                    {customer.address ? ` • ${customer.address}` : ""}
                  </div>
                  {customer.vehicleNumber && (
                    <div style={styles.vehicleChip}>
                      {customer.vehicleNumber}
                    </div>
                  )}
                </div>
                <button
                  style={styles.viewBtn}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  View History
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SELECTED CUSTOMER */}
      {selectedCustomer && (
        <section style={styles.selectedCard}>
          <div style={styles.selectedCardInner}>
            <div>
              <div style={styles.selectedName}>{selectedCustomer.email}</div>
              <div style={styles.selectedMeta}>
                {selectedCustomer.phone}
                {selectedCustomer.address
                  ? ` • ${selectedCustomer.address}`
                  : ""}
              </div>
              {selectedCustomer.vehicleNumber && (
                <div style={styles.selectedVehicle}>
                  {selectedCustomer.vehicleNumber}
                </div>
              )}
            </div>
            <button onClick={handleClose} style={styles.closeBtn} title="Close">
              ✕
            </button>
          </div>
        </section>
      )}

      {/* LOADING */}
      {loading && (
        <div style={styles.loadingCard}>Loading customer history...</div>
      )}

      {/* HISTORY */}
      {history && !loading && (
        <>
          {/* SUMMARY */}
          <section style={styles.summaryGrid}>
            <div
              style={{
                ...styles.summaryCard,
                borderLeft: "5px solid #2563eb",
              }}
            >
              <div style={styles.summaryLabel}>Total Purchases</div>
              <div style={{ ...styles.summaryValue, color: "#2563eb" }}>
                Rs. {history.totalPurchaseAmount}
              </div>
            </div>
            <div
              style={{
                ...styles.summaryCard,
                borderLeft: "5px solid #16a34a",
              }}
            >
              <div style={styles.summaryLabel}>Total Paid</div>
              <div style={{ ...styles.summaryValue, color: "#16a34a" }}>
                Rs. {history.totalPaidAmount}
              </div>
            </div>
            <div
              style={{
                ...styles.summaryCard,
                borderLeft: "5px solid #dc2626",
              }}
            >
              <div style={styles.summaryLabel}>Pending Balance</div>
              <div style={{ ...styles.summaryValue, color: "#dc2626" }}>
                Rs. {history.pendingBalance}
              </div>
            </div>
          </section>

          {/* VEHICLES */}
          <section style={{ ...styles.sectionCard, marginBottom: "20px" }}>
            <h2 style={styles.sectionTitle}>Registered Vehicles</h2>
            {history.vehicles.length === 0 ? (
              <div style={styles.emptyBox}>No vehicles found.</div>
            ) : (
              <div style={styles.vehicleGrid}>
                {history.vehicles.map((vehicle) => (
                  <div key={vehicle.vehicleId} style={styles.vehicleCard}>
                    <div style={styles.vehicleNumber}>
                      {vehicle.vehicleNumber}
                    </div>
                    <div style={styles.vehicleInfo}>
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div style={styles.vehicleYear}>{vehicle.year}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* HISTORY LAYOUT */}
          <div style={styles.historyLayout}>
            {/* PURCHASE HISTORY */}
            <section style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Purchase History</h2>
              {history.purchaseHistory.length === 0 ? (
                <div style={styles.emptyBox}>No purchase history found.</div>
              ) : (
                history.purchaseHistory.map((sale) => {
                  const statusStyle = getStatusColor(sale.paymentStatus);
                  const paidAmount = sale.payments.reduce(
                    (sum, p) => sum + p.amountPaid,
                    0,
                  );
                  const remaining = sale.finalAmount - paidAmount;

                  return (
                    <div key={sale.saleId} style={styles.historyCard}>
                      <div style={styles.cardTop}>
                        <div>
                          <h3 style={styles.invoiceTitle}>
                            Invoice #{sale.saleId}
                          </h3>
                          <div style={styles.dateText}>
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          style={{
                            ...styles.statusBadge,
                            background: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {sale.paymentStatus}
                        </div>
                      </div>

                      <div style={styles.partsGrid}>
                        {sale.items.map((item) => (
                          <div key={item.salesItemId} style={styles.partItem}>
                            <div>
                              <div style={styles.partName}>{item.partName}</div>
                              <div style={styles.partQty}>
                                Qty: {item.quantity}
                              </div>
                            </div>
                            <div style={styles.partPrice}>
                              Rs. {item.lineTotal}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={styles.invoiceSummary}>
                        <div>
                          Discount: <strong>Rs. {sale.discount}</strong>
                        </div>
                        <div>
                          Final: <strong>Rs. {sale.finalAmount}</strong>
                        </div>
                        <div>
                          Paid: <strong>Rs. {paidAmount}</strong>
                        </div>
                        <div>
                          Remaining: <strong>Rs. {remaining}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* SERVICE HISTORY */}
            <section style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Service History</h2>
              {history.serviceHistory.length === 0 ? (
                <div style={styles.emptyBox}>No service history found.</div>
              ) : (
                history.serviceHistory.map((service) => {
                  const statusStyle = getStatusColor(service.status);
                  return (
                    <div key={service.appointmentId} style={styles.serviceCard}>
                      <div style={styles.cardTop}>
                        <div>
                          <h3 style={styles.invoiceTitle}>
                            {service.vehicleNumber}
                          </h3>
                          <div style={styles.dateText}>
                            {new Date(
                              service.appointmentDate,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          style={{
                            ...styles.statusBadge,
                            background: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {service.status}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  //   page: {
  //     minHeight: "100vh",
  //     background: "linear-gradient(180deg,#f8fbff 0%,#f4f7fb 45%,#f8fafc 100%)",
  //   },
  content: {
    maxWidth: "1100px",
    marginTop: "-28px",
    //padding: "22px 24px 50px",
  },
  //header: {
  // marginBottom: "20px",
  //},
  pageTitle: {
    fontSize: "2.3rem",
    fontWeight: "800",
    marginBottom: "10px",
    color: "#0f172a",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1rem",
  },
  searchSection: {
    background: "#fff",
    borderRadius: "24px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    marginBottom: "18px",
  },
  searchRow: {
    display: "flex",
    gap: "12px",
  },
  searchInput: {
    flex: 1,
    padding: "15px 18px",
    borderRadius: "14px",
    border: "1px solid #dbeafe",
    fontSize: "0.95rem",
    outline: "none",
  },
  searchBtn: {
    padding: "14px 24px",
    borderRadius: "14px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  errorBox: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "14px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "600",
  },
  customerList: {
    marginTop: "16px",
    display: "grid",
    gap: "12px",
  },
  customerCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
  },
  customerEmail: {
    fontWeight: "800",
    fontSize: "1.1rem",
    color: "#0f172a",
    marginBottom: "6px",
  },
  customerMeta: {
    color: "#64748b",
    marginBottom: "10px",
  },
  vehicleChip: {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700",
    fontSize: "0.8rem",
  },
  viewBtn: {
    padding: "11px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  selectedCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    marginBottom: "18px",
  },
  selectedCardInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  selectedName: {
    fontSize: "1.7rem",
    fontWeight: "800",
    marginBottom: "8px",
    color: "#0f172a",
  },
  selectedMeta: {
    color: "#64748b",
    marginBottom: "12px",
  },
  selectedVehicle: {
    display: "inline-flex",
    padding: "7px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700",
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px 14px",
    fontSize: "1rem",
    color: "#64748b",
    cursor: "pointer",
    fontWeight: "700",
    lineHeight: 1,
  },
  loadingCard: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "18px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700",
    textAlign: "center",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "22px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
  },
  summaryLabel: {
    color: "#64748b",
    marginBottom: "10px",
    fontWeight: "700",
  },
  summaryValue: {
    fontSize: "2rem",
    fontWeight: "800",
  },
  historyLayout: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
    alignItems: "start",
  },
  // ↓ marginBottom removed here — applied inline only where needed
  sectionCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    border: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "800",
    marginBottom: "18px",
    color: "#0f172a",
  },
  emptyBox: {
    padding: "24px",
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    textAlign: "center",
    color: "#64748b",
  },
  vehicleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px",
  },
  vehicleCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    background: "#f8fafc",
  },
  vehicleNumber: {
    fontWeight: "800",
    fontSize: "1rem",
    marginBottom: "8px",
    color: "#0f172a",
  },
  vehicleInfo: {
    color: "#475569",
    marginBottom: "6px",
  },
  vehicleYear: {
    color: "#64748b",
    fontSize: "0.9rem",
  },
  historyCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "18px",
    marginBottom: "16px",
    background: "#fff",
  },
  serviceCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    marginBottom: "14px",
    background: "#fff",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
  },
  invoiceTitle: {
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "4px",
  },
  dateText: {
    color: "#64748b",
    fontSize: "0.9rem",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.75rem",
  },
  partsGrid: {
    display: "grid",
    gap: "10px",
  },
  partItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "14px",
  },
  partName: {
    fontWeight: "700",
    marginBottom: "4px",
  },
  partQty: {
    color: "#64748b",
    fontSize: "0.85rem",
  },
  partPrice: {
    fontWeight: "800",
    color: "#2563eb",
  },
  invoiceSummary: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: "12px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
    color: "#475569",
    fontSize: "0.92rem",
  },
};
