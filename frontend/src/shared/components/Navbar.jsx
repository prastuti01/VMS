import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { logout as logoutAPI } from "../config/api";

// Maps each role to their home page
const getRoleHome = (role) => {
  if (role === "Customer") return "/customer/dashboard";
  if (role === "Staff") return "/staff/dashboard";
  if (role === "Admin") return "/admin/dashboard";

  return "/login";
};

const Navbar = () => {
  const { user, role, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (_) {
      // continue logout locally
    }

    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      {/* LEFT */}
      <div
        style={styles.logoWrapper}
        onClick={() => navigate(getRoleHome(role))}
      >
        <div style={styles.logoIcon}>
          <span style={styles.logoLetter}>V</span>
        </div>

        <div style={styles.logoTextWrapper}>
          <span style={styles.logoText}>FleetControl</span>
          <span style={styles.logoSubtext}>Vehicle Management</span>
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        {user && (
          <div style={styles.userSection}>
            <div style={styles.avatar}>
              {user.email?.charAt(0).toUpperCase()}
            </div>

            <div style={styles.userMeta}>
              <span style={styles.userEmail}>{user.email}</span>

              <span style={styles.roleBadge}>{role}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "#2563eb";
            event.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "#1d4ed8";
            event.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaSignOutAlt size={14} />
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: "74px",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    background: "rgba(30, 64, 175, 0.96)",

    backdropFilter: "blur(14px)",

    borderBottom: "1px solid rgba(255,255,255,0.08)",

    boxShadow: "0 10px 35px rgba(15, 23, 42, 0.18)",
  },

  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    cursor: "pointer",
  },

  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",

    background:
      "linear-gradient(135deg, #60a5fa 0%, #3b82f6 45%, #2563eb 100%)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.35)",
  },

  logoLetter: {
    color: "#fff",
    fontWeight: "800",
    fontSize: "1.1rem",
    fontFamily: "'Sora', sans-serif",
  },

  logoTextWrapper: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.05,
  },

  logoText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: "1.1rem",
    fontFamily: "'Sora', sans-serif",
    letterSpacing: "-0.03em",
  },

  logoSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginTop: "4px",
    fontWeight: "700",
    fontFamily: "'DM Sans', sans-serif",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",

    background:
      "linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)",

    color: "#fff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontWeight: "800",
    fontSize: "0.95rem",

    boxShadow: "0 8px 20px rgba(59,130,246,0.35)",
  },

  userMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  userEmail: {
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: "700",
    fontFamily: "'DM Sans', sans-serif",
  },

  roleBadge: {
    width: "fit-content",

    padding: "4px 10px",

    borderRadius: "999px",

    background: "rgba(255,255,255,0.12)",

    border: "1px solid rgba(255,255,255,0.14)",

    color: "#dbeafe",

    fontSize: "0.72rem",
    fontWeight: "700",

    letterSpacing: "0.03em",

    textTransform: "uppercase",

    fontFamily: "'DM Sans', sans-serif",
  },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",

    background: "#1d4ed8",

    border: "1px solid rgba(255,255,255,0.12)",

    color: "#fff",

    padding: "11px 18px",

    borderRadius: "14px",

    cursor: "pointer",

    fontSize: "0.88rem",
    fontWeight: "700",

    fontFamily: "'DM Sans', sans-serif",

    transition: "all 0.2s ease",

    boxShadow: "0 10px 24px rgba(37,99,235,0.28)",
  },
};

export default Navbar;
