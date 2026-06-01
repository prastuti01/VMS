import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { getProfile } from "../services/customerService";
import { getMyAppointments } from "../services/appointmentService";

import { getMyPartRequests } from "../services/partRequestService";

const StatCard = ({ icon, label, value, accent }) => (
  <div style={styles.statCard}>
    <div
      style={{
        ...styles.statIcon,
        background: accent ? "#eff6ff" : "#f8fafc",
      }}
    >
      {icon}
    </div>

    <div>
      <div style={styles.statLabel}>{label}</div>
      <div
        style={{
          ...styles.statValue,
          color: accent ? "#2563eb" : "var(--text-h)",
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

const QuickLink = ({ icon, label, desc, onClick }) => (
  <button
    onClick={onClick}
    style={styles.quickLink}
    onMouseEnter={(event) => {
      event.currentTarget.style.borderColor = "#93c5fd";
      event.currentTarget.style.background = "#eff6ff";
      event.currentTarget.style.transform = "translateY(-3px)";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.borderColor = "#e5e7eb";
      event.currentTarget.style.background = "#fff";
      event.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div style={styles.quickIcon}>{icon}</div>

    <div>
      <div style={styles.quickLabel}>{label}</div>
      <div style={styles.quickDesc}>{desc}</div>
    </div>
  </button>
);

const CarIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M3 9h18" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PartIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ReviewIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h8" />
    <path d="M8 7h5" />
  </svg>
);

const HistoryIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const [partRequests, setPartRequests] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [profileRes, appointmentsRes, partRequestsRes] =
          await Promise.all([
            getProfile(),
            getMyAppointments(),
            getMyPartRequests(),
          ]);

        setProfile(profileRes.data);

        setAppointments(appointmentsRes.data || []);

        setPartRequests(partRequestsRes.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const vehicleCount = profile?.vehicles?.length ?? 0;

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";

    return "Good evening";
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.content}>
        <section style={styles.hero} className="anim-1">
          <div>
            {loading ? (
              <div
                style={{
                  ...styles.skeleton,
                  width: "300px",
                  height: "38px",
                  marginBottom: "12px",
                }}
              />
            ) : (
              <h1 style={styles.greeting}>
                {greeting()}, {user?.email?.split("@")[0]} 👋
              </h1>
            )}

            <p style={styles.sub}>
              Welcome back. Here’s a quick overview of your account and vehicle
              activity.
            </p>
          </div>

          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeLabel}>Customer Portal</span>
            <strong>FleetControl</strong>
          </div>
        </section>

        <section style={styles.section} className="anim-2">
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <span style={styles.accent} />
                Overview
              </h2>
              <p style={styles.sectionSub}>Your account summary</p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <StatCard
              icon={<CarIcon />}
              label="Vehicles Registered"
              value={loading ? "—" : vehicleCount}
              accent
            />

            <StatCard
              icon={<CalIcon />}
              label="Appointments"
              value={loading ? "—" : appointments?.length || 0}
              accent
            />

            <StatCard
              icon={<PartIcon />}
              label="Part Requests"
              value={loading ? "—" : partRequests?.length || 0}
              accent
            />
          </div>
        </section>

        <section style={styles.section} className="anim-3">
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <span style={styles.accent} />
                Quick Actions
              </h2>
              <p style={styles.sectionSub}>Common things you can do quickly</p>
            </div>
          </div>

          <div style={styles.quickGrid}>
            <QuickLink
              icon={<UserIcon />}
              label="My Profile"
              desc="View and edit your contact information"
              onClick={() => navigate("/customer/profile")}
            />

            <QuickLink
              icon={<CarIcon />}
              label="My Vehicles"
              desc="Manage your registered vehicles"
              onClick={() => navigate("/customer/profile")}
            />

            <QuickLink
              icon={<CalIcon />}
              label="Book Appointment"
              desc="Schedule a vehicle service visit"
              onClick={() => navigate("/customer/book-appointment")}
            />

            <QuickLink
              icon={<PartIcon />}
              label="Request a Part"
              desc="Submit a request for unavailable parts"
              onClick={() => navigate("/customer/part-requests")}
            />

            <QuickLink
              icon={<ReviewIcon />}
              label="Submit Reviews"
              desc="Share feedback about services and purchased parts"
              onClick={() => navigate("/customer/reviews")}
            />

            <QuickLink
              icon={<HistoryIcon />}
              label="Purchase & Service History"
              desc="View your purchase and service history"
              onClick={() => navigate("/customer/history")}
            />
          </div>
        </section>

        <section style={styles.section} className="anim-4">
          <div style={styles.vehicleHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <span style={styles.accent} />
                Your Vehicles
              </h2>
              <p style={styles.sectionSub}>
                Recently registered vehicles linked to your profile
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/customer/profile")}
              style={styles.viewAllBtn}
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div style={styles.vehiclePreview}>
              {[1, 2].map((item) => (
                <div
                  key={item}
                  style={{ ...styles.skeleton, height: "82px" }}
                />
              ))}
            </div>
          ) : vehicleCount === 0 ? (
            <div style={styles.emptyVehicle}>
              <h3>No vehicles registered yet</h3>
              <p>Add your first vehicle from your profile page.</p>

              <button
                type="button"
                onClick={() => navigate("/customer/profile")}
                style={styles.emptyBtn}
              >
                Add Vehicle
              </button>
            </div>
          ) : (
            <div style={styles.vehiclePreview}>
              {profile.vehicles.map((vehicle) => (
                <div key={vehicle.vehicleId} style={styles.vehicleItem}>
                  <div>
                    <div style={styles.vehicleName}>
                      {vehicle.brand} {vehicle.model}
                    </div>

                    <div style={styles.vehicleReg}>
                      {vehicle.vehicleNumber} · {vehicle.year}
                    </div>
                  </div>

                  <div style={styles.vehicleIcon}>
                    <CarIcon />
                  </div>
                </div>
              ))}
            </div>
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

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px",
    padding: "30px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(30, 64, 175, 0.95))",
    color: "#fff",
    boxShadow: "0 24px 55px rgba(37, 99, 235, 0.22)",
  },

  greeting: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "2.1rem",
    color: "#fff",
    margin: "0 0 10px",
    letterSpacing: "-0.04em",
  },

  sub: {
    fontSize: "0.98rem",
    color: "rgba(255,255,255,0.78)",
    margin: 0,
    maxWidth: "620px",
    lineHeight: 1.6,
  },

  heroBadge: {
    minWidth: "180px",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.16)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  heroBadgeLabel: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.75)",
    fontWeight: "700",
  },

  section: {
    marginBottom: "30px",
    padding: "28px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
  },

  sectionHeader: {
    marginBottom: "20px",
  },

  sectionTitle: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "1.12rem",
    color: "var(--text-h)",
    margin: "0 0 6px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  sectionSub: {
    color: "var(--text)",
    margin: 0,
    fontSize: "0.9rem",
  },

  accent: {
    width: "5px",
    height: "22px",
    background: "#2563eb",
    borderRadius: "999px",
    display: "inline-block",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "16px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.04)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statLabel: {
    fontSize: "0.76rem",
    color: "var(--text)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "4px",
    fontWeight: "700",
  },

  statValue: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "1.55rem",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },

  quickLink: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "22px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.22s ease",
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.04)",
  },

  quickIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  quickLabel: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "0.98rem",
    color: "var(--text-h)",
    marginBottom: "6px",
  },

  quickDesc: {
    fontSize: "0.86rem",
    color: "var(--text)",
    lineHeight: 1.5,
  },

  vehicleHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "20px",
  },

  viewAllBtn: {
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "0.88rem",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    padding: "10px 15px",
    borderRadius: "999px",
  },

  vehiclePreview: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
  },

  vehicleItem: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  vehicleName: {
    fontWeight: "800",
    fontSize: "0.98rem",
    color: "var(--text-h)",
    fontFamily: "'Sora', sans-serif",
    marginBottom: "4px",
  },

  vehicleReg: {
    fontSize: "0.82rem",
    color: "var(--text)",
  },

  vehicleIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyVehicle: {
    border: "1.5px dashed #bfdbfe",
    borderRadius: "20px",
    padding: "38px 22px",
    textAlign: "center",
    color: "var(--text)",
    background: "#f8fbff",
  },

  emptyBtn: {
    marginTop: "14px",
    background: "#2563eb",
    border: "none",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    padding: "11px 18px",
    borderRadius: "14px",
  },

  skeleton: {
    background: "#e5e7eb",
    borderRadius: "14px",
    height: "20px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
};
