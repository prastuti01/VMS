import {
  FaChartBar,
  FaFileInvoice,
  FaHistory,
  FaSearch,
  FaShieldAlt,
  FaTachometerAlt,
  FaTimes,
  FaUserPlus,
  FaWrench,
} from "react-icons/fa";

const staffNavItems = [
  { id: "staffDashboard", label: "Staff Dashboard", icon: FaTachometerAlt },
  { id: "registerCustomer", label: "Register Customer", icon: FaUserPlus },
  { id: "customerHistory", label: "Customer History", icon: FaHistory },
  { id: "salesInvoices", label: "Sales Invoices", icon: FaFileInvoice },
  { id: "customerReports", label: "Customer Reports", icon: FaChartBar },
];

export default function StaffSidebar({
  activeView,
  onNavigate,
  isOpen = false,
  onClose,
}) {
  function handleNavigate(id) {
    onNavigate(id);
    onClose?.();
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="sidebar-close" type="button" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="brand">
          <div className="brand-mark">
            <FaWrench size={25} />
          </div>

          <div>
            <strong>FleetControl</strong>
            <span>Staff Portal</span>
          </div>
        </div>

        <nav className="nav-list">
          {staffNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => handleNavigate(item.id)}
            >
              <item.icon size={22} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-summary">
          <FaShieldAlt size={22} />

          <div>
            <strong>Staff</strong>
            <span>FleetControl</span>
          </div>
        </div>
      </aside>
    </>
  );
}
