import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/Navbar";
import { getCustomerHistory } from "../services/customerService";

const BackIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

export default function CustomerHistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getCustomerHistory();
      setHistory(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return {
          bg: "#dcfce7",
          text: "#166534",
        };

      case "partial":
      case "pending":
        return {
          bg: "#fef3c7",
          text: "#92400e",
        };

      case "cancelled":
      case "unpaid":
        return {
          bg: "#fee2e2",
          text: "#b91c1c",
        };

      default:
        return {
          bg: "#e5e7eb",
          text: "#374151",
        };
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />

        <div style={styles.loading}>Loading history...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.content}>
        <button
          style={styles.backBtn}
          type="button"
          onClick={() => navigate("/customer/dashboard")}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "#dbeafe";
            event.currentTarget.style.transform = "translateX(-2px)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "#eff6ff";
            event.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <BackIcon />
          Back to dashboard
        </button>

        <h1 style={styles.pageTitle}>Purchase & Service History</h1>

        <p style={styles.subtitle}>
          View your purchase invoices, payments, and vehicle service records.
        </p>

        {/* SUMMARY CARDS */}

        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Purchases</div>

            <div
              style={{
                ...styles.summaryValue,
                color: "#2563eb",
              }}
            >
              Rs. {history.totalPurchaseAmount}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Paid</div>

            <div
              style={{
                ...styles.summaryValue,
                color: "#16a34a",
              }}
            >
              Rs. {history.totalPaidAmount}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Pending Balance</div>

            <div
              style={{
                ...styles.summaryValue,
                color: "#dc2626",
              }}
            >
              Rs. {history.pendingBalance}
            </div>
          </div>
        </section>

        {/* PURCHASE HISTORY */}

        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <span style={styles.accent} />
                Purchase History
              </h2>

              <p style={styles.sectionSub}>
                Your purchase invoices and parts history.
              </p>
            </div>
          </div>

          {history.purchaseHistory.length === 0 ? (
            <div style={styles.emptyBox}>No purchase history found.</div>
          ) : (
            history.purchaseHistory.map((sale) => {
              const statusStyle = getStatusColor(sale.paymentStatus);

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

                  <div style={styles.amountRow}>
                    <div>Final Amount</div>

                    <strong>Rs. {sale.finalAmount}</strong>
                  </div>

                  <div style={styles.partsSection}>
                    <h4 style={styles.partsTitle}>Purchased Parts</h4>

                    <div style={styles.partsGrid}>
                      {sale.items.map((item) => (
                        <div key={item.salesItemId} style={styles.partItem}>
                          <div>
                            <div style={styles.partName}>{item.partName}</div>

                            <div style={styles.partQty}>
                              Quantity: {item.quantity}
                            </div>
                          </div>

                          <div style={styles.partPrice}>
                            Rs. {item.lineTotal}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* SERVICE HISTORY */}

        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <span style={styles.accent} />
                Service History
              </h2>

              <p style={styles.sectionSub}>
                Your appointment and service records.
              </p>
            </div>
          </div>

          {history.serviceHistory.length === 0 ? (
            <div style={styles.emptyBox}>No service history found.</div>
          ) : (
            history.serviceHistory.map((service) => {
              const statusStyle = getStatusColor(service.status);

              return (
                <div key={service.appointmentId} style={styles.historyCard}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.invoiceTitle}>
                        {service.vehicleNumber}
                      </h3>

                      <div style={styles.dateText}>
                        {new Date(service.appointmentDate).toLocaleDateString()}
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
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fbff 0%, #f4f7fb 45%, #f8fafc 100%)",
  },

  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "38px 24px 90px",
  },

  loading: {
    textAlign: "center",
    paddingTop: "120px",
    fontWeight: "700",
    color: "#64748b",
  },

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 16px",
    marginBottom: "28px",
    border: "1px solid #dbeafe",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(37, 99, 235, 0.08)",
    transition: "all 0.2s ease",
  },

  pageTitle: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "2.3rem",
    color: "#0f172a",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#64748b",
    marginBottom: "35px",
    fontSize: "1rem",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
    marginBottom: "35px",
  },

  summaryCard: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
  },

  summaryLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginBottom: "12px",
    fontWeight: "700",
  },

  summaryValue: {
    fontSize: "2rem",
    fontWeight: "800",
    fontFamily: "'Sora', sans-serif",
  },

  sectionCard: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "28px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
  },

  sectionHeader: {
    marginBottom: "24px",
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "1.2rem",
    color: "#0f172a",
    marginBottom: "6px",
  },

  sectionSub: {
    color: "#64748b",
    fontSize: "0.92rem",
  },

  accent: {
    width: "5px",
    height: "22px",
    background: "#2563eb",
    borderRadius: "999px",
    display: "inline-block",
  },

  emptyBox: {
    padding: "30px",
    border: "1.5px dashed #cbd5e1",
    borderRadius: "18px",
    textAlign: "center",
    color: "#64748b",
    background: "#f8fafc",
  },

  historyCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "18px",
    background: "#fff",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "18px",
  },

  invoiceTitle: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "6px",
  },

  dateText: {
    color: "#64748b",
    fontSize: "0.9rem",
  },

  statusBadge: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "20px",
    color: "#334155",
  },

  partsSection: {
    marginTop: "10px",
  },

  partsTitle: {
    marginBottom: "14px",
    fontSize: "1rem",
    fontWeight: "700",
    color: "#0f172a",
  },

  partsGrid: {
    display: "grid",
    gap: "12px",
  },

  partItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
  },

  partName: {
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
  },

  partQty: {
    fontSize: "0.85rem",
    color: "#64748b",
  },

  partPrice: {
    fontWeight: "800",
    color: "#2563eb",
  },
};
