import { FaShieldAlt, FaWrench } from "react-icons/fa";
import { adminNavItems } from "../../data/navigation";

export function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <FaWrench size={25} />
        </div>

        <div>
          <strong>FleetControl</strong>
          <span>Vehicle Management</span>
        </div>
      </div>

      <nav className="nav-list">
        {adminNavItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={22} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-summary">
        <FaShieldAlt size={22} />

        <div>
          <strong>Admin</strong>
        </div>
      </div>
    </aside>
  );
}
