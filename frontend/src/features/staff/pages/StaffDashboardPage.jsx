import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaCar,
  FaChartBar,
  FaFileInvoice,
  FaHistory,
  FaPlus,
  FaSearch,
  FaSignOutAlt,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import CustomerHistoryLookupPage from "./CustomerHistoryLookupPage";
import StaffSidebar from "../components/StaffSidebar";
import axiosInstance from "../../../shared/config/axiosInstance";
import CustomerModal from "../components/CustomerModal";
import InvoiceWorkspace from "../../invoices/InvoiceWorkspace";
import { useAuth } from "../../../context/AuthContext";
import {
  logout as logoutAPI,
  getCustomers,
  searchCustomers,
  salesInvoiceApi,
} from "../../../shared/config/api";

import { viewTitles } from "../../../data/navigation";

import "../../../App.css";

function getCustomerVehicle(customer) {
  return customer.vehicle || customer.vehicles?.[0] || null;
}

function StaffTopbar({ activeView, onOpenSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logoutAPI();
    } catch (error) {
      console.log(error);
      // logout locally even if backend logout fails
    }

    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <button
        className="mobile-menu-button"
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>

      <div>
        <h1>{viewTitles[activeView] || "Staff Dashboard"}</h1>
      </div>

      <div style={styles.topbarRight}>
        <button
          className="icon-button"
          type="button"
          title="Notifications"
          aria-label="Notifications"
        >
          <FaBell size={20} />
          <span className="notification-dot" />
        </button>

        <button
          className="secondary-button logout-button"
          type="button"
          onClick={handleLogout}
        >
          <FaSignOutAlt size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default function StaffDashboardPage() {
  const [activeView, setActiveView] = useState("staffDashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();

      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  useEffect(() => {
    async function loadInitialCustomers() {
      try {
        const response = await getCustomers();

        setCustomers(response.data);
        const invoices = await salesInvoiceApi.list();

        setSalesInvoices(invoices);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    }

    loadInitialCustomers();
  }, []);

  useEffect(() => {
    const loadSearch = async () => {
      try {
        if (!query.trim()) {
          await fetchCustomers();
        } else {
          const response = await searchCustomers(query);

          setCustomers(response.data);
        }
      } catch (error) {
        console.error("Customer search failed", error);
      }
    };

    loadSearch();
  }, [query]);

  async function handleCreateCustomer(payload) {
    await axiosInstance.post("/staff/customers", payload);

    await fetchCustomers();
    setShowCustomerModal(false);
    setMessage("Customer registered successfully.");

    setTimeout(() => setMessage(""), 3000);
  }

  const customersWithVehicles = customers.filter(
    (customer) => getCustomerVehicle(customer) !== null,
  ).length;

  const renderContent = () => {
    switch (activeView) {
      case "registerCustomer":
        return (
          <>
            {message && <div style={styles.successBox}>{message}</div>}

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Register Customer</h2>
                  <p style={styles.sectionSub}>
                    Add new customers with vehicle information.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => setShowCustomerModal(true)}
                >
                  <FaPlus />
                  Add Customer
                </button>
              </div>

              <label style={styles.searchBox}>
                <FaSearch size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search customer or vehicle..."
                  style={styles.searchInput}
                />
              </label>

              <div style={{ marginTop: "20px" }}>
                {customers.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <FaUserPlus size={30} />
                    <h3>Create Customer Accounts</h3>
                    <p>
                      Click Add Customer to register a customer with vehicle
                      details.
                    </p>
                  </div>
                ) : customers.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <FaSearch size={28} />
                    <h3>No matching customers</h3>
                    <p>
                      Try searching by email, phone, address, or vehicle number.
                    </p>
                  </div>
                ) : (
                  <CustomerList customers={customers} />
                )}
              </div>
            </section>
          </>
        );

      case "customerHistory":
        return <CustomerHistoryLookupPage />;

      case "salesInvoices":
        return <InvoiceWorkspace mode="sales" />;

      case "emailInvoices":
        return <InvoiceWorkspace mode="email" />;

      case "customerReports":
        return (
          <ComingSoon
            icon={<FaChartBar size={30} />}
            title="Customer Reports"
            text="Generate reports for regular customers, high spenders, and pending credits."
          />
        );

      default:
        return (
          <>
            <section style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <FaUsers />
                </div>
                <div>
                  <p style={styles.statLabel}>CUSTOMERS ADDED</p>
                  <h2 style={styles.statValue}>{customers.length}</h2>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <FaCar />
                </div>
                <div>
                  <p style={styles.statLabel}>VEHICLES ADDED</p>
                  <h2 style={styles.statValue}>{customersWithVehicles}</h2>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <FaFileInvoice />
                </div>
                <div>
                  <p style={styles.statLabel}>INVOICES</p>
                  <h2 style={styles.statValue}>{salesInvoices.length}</h2>
                </div>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Staff Features</h2>
                  <p style={styles.sectionSub}>
                    Features required according to the coursework.
                  </p>
                </div>
              </div>

              <div style={styles.featureGrid}>
                <button
                  type="button"
                  style={styles.featureCard}
                  onClick={() => setActiveView("registerCustomer")}
                >
                  <div style={styles.featureIcon}>
                    <FaUserPlus />
                  </div>
                  <div>
                    <h3 style={styles.featureTitle}>Register Customer</h3>
                    <p style={styles.featureDesc}>
                      Create customer accounts, register vehicle details, and
                      search customer records.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  style={styles.featureCard}
                  onClick={() => setActiveView("customerHistory")}
                >
                  <div style={styles.featureIcon}>
                    <FaHistory />
                  </div>

                  <div>
                    <h3 style={styles.featureTitle}>Customer History</h3>

                    <p style={styles.featureDesc}>
                      View purchases and vehicle service history.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  style={styles.featureCard}
                  onClick={() => setActiveView("salesInvoices")}
                >
                  <div style={styles.featureIcon}>
                    <FaFileInvoice />
                  </div>

                  <div>
                    <h3 style={styles.featureTitle}>Sales Invoices</h3>

                    <p style={styles.featureDesc}>
                      Create, manage, and email sales invoices.
                    </p>
                  </div>
                </button>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Recent Customers</h2>
                  <p style={styles.sectionSub}>
                    Recently registered customers.
                  </p>
                </div>
              </div>

              {customers.length === 0 ? (
                <div style={styles.emptyBox}>
                  <FaUsers size={28} />
                  <h3>No customers yet</h3>
                  <p>
                    Go to Register Customer from the sidebar to add your first
                    customer.
                  </p>
                </div>
              ) : (
                <CustomerList customers={customers} />
              )}
            </section>
          </>
        );
    }
  };

  return (
    <div className="app-shell">
      <StaffSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="workspace">
        <StaffTopbar
          activeView={activeView}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <section className="content-area">{renderContent()}</section>
      </main>

      {showCustomerModal && (
        <CustomerModal
          onClose={() => setShowCustomerModal(false)}
          onSave={handleCreateCustomer}
        />
      )}
    </div>
  );
}

function CustomerList({ customers }) {
  return (
    <div style={styles.customerList}>
      {customers.map((customer) => {
        const vehicle = getCustomerVehicle(customer);

        return (
          <div
            key={customer.customerId || customer.email}
            style={styles.customerRow}
          >
            <div>
              <h3 style={styles.customerEmail}>{customer.email}</h3>
              <p style={styles.customerText}>
                {customer.phone || "No phone"} ·{" "}
                {customer.address || "No address"}
              </p>

              {vehicle && (
                <p style={styles.vehicleText}>
                  {vehicle.brand} {vehicle.model} · {vehicle.year}
                </p>
              )}
            </div>

            {vehicle ? (
              <span style={styles.vehicleBadge}>{vehicle.vehicleNumber}</span>
            ) : (
              <span style={styles.noVehicleBadge}>No vehicle</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ComingSoon({ icon, title, text }) {
  return (
    <section style={styles.card}>
      <div style={styles.emptyBox}>
        {icon}
        <h3>{title}</h3>
        <p>{text}</p>
        <span style={styles.comingSoon}>Coming Soon</span>
      </div>
    </section>
  );
}

const styles = {
  topbarRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  successBox: {
    marginBottom: "20px",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#059669",
    fontWeight: "700",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "22px",
  },

  statIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  statLabel: {
    margin: "0 0 5px",
    color: "#6b7280",
    fontSize: "0.78rem",
    fontWeight: "700",
    letterSpacing: "0.06em",
  },

  statValue: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: "1.45rem",
    fontWeight: "800",
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "24px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "16px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: "0 0 4px",
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#111827",
  },

  sectionSub: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.88rem",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    maxWidth: "420px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#6b7280",
    marginBottom: "20px",
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    color: "#111827",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "14px",
  },

  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    textAlign: "left",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
    cursor: "pointer",
  },

  featureCardDisabled: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    textAlign: "left",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
    opacity: 0.7,
  },

  featureIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  featureTitle: {
    margin: "0 0 5px",
    color: "#111827",
    fontSize: "0.96rem",
    fontWeight: "800",
  },

  featureDesc: {
    margin: "0 0 8px",
    color: "#6b7280",
    fontSize: "0.84rem",
    lineHeight: 1.45,
  },

  comingSoon: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "0.72rem",
    fontWeight: "700",
  },

  emptyBox: {
    padding: "48px 20px",
    textAlign: "center",
    borderRadius: "16px",
    border: "1px dashed #bfdbfe",
    background: "#f8fbff",
    color: "#6b7280",
  },

  customerList: {
    display: "grid",
    gap: "12px",
  },

  customerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderRadius: "14px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },

  customerEmail: {
    margin: "0 0 4px",
    color: "#111827",
    fontWeight: "800",
  },

  customerText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.85rem",
  },

  vehicleText: {
    margin: "5px 0 0",
    color: "#2563eb",
    fontSize: "0.82rem",
    fontWeight: "700",
  },

  vehicleBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "0.76rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  noVehicleBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "0.76rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
};
