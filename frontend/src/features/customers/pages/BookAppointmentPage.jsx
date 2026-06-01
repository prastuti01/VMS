import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaCarSide,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
} from "react-icons/fa";

import Navbar from "../../../shared/components/Navbar";
import { getApiErrorMessage } from "../../../shared/config/api";
import { getProfile } from "../services/customerService";
import { bookAppointment } from "../services/appointmentService";

const initialForm = {
  vehicleId: "",
  appointmentDate: "",
  status: "Pending",
};

function FieldLabel({ children }) {
  return <label style={styles.label}>{children}</label>;
}

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await getProfile();
        if (!isMounted) return;

        const data = response.data;
        setProfile(data);

        const firstVehicleId = data?.vehicles?.[0]?.vehicleId;
        if (firstVehicleId) {
          setForm((current) => ({
            ...current,
            vehicleId: current.vehicleId || String(firstVehicleId),
          }));
        }
      } catch (fetchError) {
        if (isMounted) {
          setError("Unable to load your vehicles. Please try again.");
          console.log(fetchError);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const vehicles = profile?.vehicles ?? [];
  const selectedVehicle = vehicles.find(
    (vehicle) => String(vehicle.vehicleId) === form.vehicleId,
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.vehicleId) {
      setError("Please select a vehicle before booking.");
      return;
    }

    if (!form.appointmentDate) {
      setError("Please choose an appointment date.");
      return;
    }

    const selectedDate = new Date(`${form.appointmentDate}T12:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please choose a valid appointment date.");
      return;
    }

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    if (selectedDate <= tomorrow) {
      setError("Appointment date must be in the future.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        vehicleId: Number(form.vehicleId),
        appointmentDate: selectedDate.toISOString(),
        status: form.status,
      };

      const response = await bookAppointment(payload);
      const createdAppointment = response.data;

      setConfirmation({
        reference: createdAppointment?.appointmentId
          ? `APT-${createdAppointment.appointmentId}`
          : `APT-${String(Date.now()).slice(-6)}`,
        vehicleLabel: selectedVehicle
          ? `${selectedVehicle.vehicleNumber} - ${selectedVehicle.brand} ${selectedVehicle.model}`
          : "Selected vehicle",
        appointmentDate: form.appointmentDate,
        status: createdAppointment?.status || form.status,
      });

      setForm((current) => ({
        ...current,
        appointmentDate: "",
        status: "Pending",
      }));
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.content}>
          {/* ── Back button ── */}
          <button
            type="button"
            onClick={() => navigate("/customer/dashboard")}
            style={styles.backButton}
          >
            <FaRegCalendarAlt />
            Back to dashboard
          </button>

          {/* ── Confirmation banner — shown at the top once booking succeeds ── */}
          {confirmation && (
            <div style={styles.confirmationCard}>
              <div style={styles.confirmationHeader}>
                <div style={styles.confirmationIconWrap}>
                  <FaCheckCircle style={styles.confirmationIcon} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={styles.confirmationTitle}>
                    Appointment requested!
                  </h2>
                  <p style={styles.confirmationSub}>
                    Reference <strong>{confirmation.reference}</strong> has been
                    created successfully.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  style={styles.confirmationDismiss}
                  aria-label="Dismiss confirmation"
                >
                  ✕
                </button>
              </div>
              <div style={styles.confirmationGrid}>
                <div style={styles.confirmationCell}>
                  <span style={styles.confirmationLabel}>Vehicle</span>
                  <strong style={styles.confirmationValue}>
                    {confirmation.vehicleLabel}
                  </strong>
                </div>
                <div style={styles.confirmationCell}>
                  <span style={styles.confirmationLabel}>Date</span>
                  <strong style={styles.confirmationValue}>
                    {confirmation.appointmentDate}
                  </strong>
                </div>
                <div style={styles.confirmationCell}>
                  <span style={styles.confirmationLabel}>Status</span>
                  <span style={styles.statusBadge}>{confirmation.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Hero ── */}
          <section style={styles.hero}>
            <span style={styles.eyebrow}>Customer Service</span>
            <h1 style={styles.title}>Book an appointment</h1>
            <p style={styles.subtitle}>
              Choose one of your registered vehicles and submit a future
              appointment date.
            </p>
          </section>

          {/* ── Main layout ── */}
          <section style={styles.layout}>
            {/* Form card */}
            <form style={styles.formCard} onSubmit={handleSubmit}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Appointment details</h2>
                  <p style={styles.cardSub}>
                    Select a vehicle and a date in the future.
                  </p>
                </div>
                <div style={styles.cardBadge}>
                  <FaRegCalendarAlt /> Booking request
                </div>
              </div>

              <div style={styles.grid}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>Vehicle</FieldLabel>
                  <select
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    style={styles.field}
                    disabled={loadingProfile || vehicles.length === 0}
                  >
                    {loadingProfile && (
                      <option value="">Loading your vehicles…</option>
                    )}
                    {!loadingProfile && vehicles.length === 0 && (
                      <option value="">No vehicles found</option>
                    )}
                    {!loadingProfile &&
                      vehicles.map((vehicle) => (
                        <option
                          key={vehicle.vehicleId}
                          value={String(vehicle.vehicleId)}
                        >
                          {vehicle.vehicleNumber} - {vehicle.brand}{" "}
                          {vehicle.model}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Appointment date</FieldLabel>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={form.appointmentDate}
                    onChange={handleChange}
                    style={styles.field}
                  />
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>
                  <input
                    type="text"
                    value="Pending"
                    style={{
                      ...styles.field,
                      background: "#f8fafc",
                      color: "#94a3b8",
                    }}
                    disabled
                  />
                </div>
              </div>

              {!loadingProfile && vehicles.length === 0 && (
                <div style={styles.emptyState}>
                  <strong>No vehicles are linked to your profile yet.</strong>
                  <p style={{ margin: "6px 0 0" }}>
                    Add a vehicle first, then come back to book your
                    appointment.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/customer/profile")}
                    style={styles.profileButton}
                  >
                    Go to profile
                  </button>
                </div>
              )}

              {error && <div style={styles.errorBox}>{error}</div>}

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate("/customer/dashboard")}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={
                    submitting || loadingProfile || vehicles.length === 0
                  }
                >
                  {submitting ? "Booking…" : "Book Appointment"}
                </button>
              </div>
            </form>

            {/* Sidebar */}
            <aside style={styles.sideColumn}>
              <div style={styles.sideCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Selected vehicle</h2>
                    <p style={styles.cardSub}>Pulled from your profile</p>
                  </div>
                </div>

                {selectedVehicle ? (
                  <div style={styles.vehicleSummary}>
                    <strong style={styles.vehicleSummaryTitle}>
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </strong>
                    <p style={styles.vehicleSummaryText}>
                      {selectedVehicle.vehicleNumber} · {selectedVehicle.year}
                    </p>
                  </div>
                ) : (
                  <div style={styles.vehicleEmpty}>
                    {loadingProfile
                      ? "Loading vehicles from your profile..."
                      : "Add a vehicle in your profile to continue."}
                  </div>
                )}
              </div>

              <div style={styles.sideCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>How it works</h2>
                    <p style={styles.cardSub}>A quick booking flow</p>
                  </div>
                </div>

                <div style={styles.stepList}>
                  {[
                    "Choose a registered vehicle from your profile.",
                    "Pick a future date for the appointment.",
                    "Submit and receive a pending appointment booking.",
                  ].map((text, i) => (
                    <div key={i} style={styles.stepItem}>
                      <div style={styles.stepNumber}>{i + 1}</div>
                      <p style={styles.stepText}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(96, 165, 250, 0.12), transparent 35%), linear-gradient(180deg, #f7fbff 0%, #f4f7fb 50%, #f8fafc 100%)",
  },
  content: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "32px 24px 88px",
  },

  /* ── Back button ── */
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 16px",
    marginBottom: "20px",
    border: "1px solid #dbeafe",
    borderRadius: "999px",
    background: "rgba(239, 246, 255, 0.9)",
    color: "#2563eb",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
  },

  /* ── Confirmation banner ── */
  confirmationCard: {
    marginBottom: "24px",
    background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
    border: "1px solid #6ee7b7",
    borderRadius: "20px",
    padding: "20px 24px",
    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.12)",
    animation: "slideDown 0.35s ease",
  },
  confirmationHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  confirmationIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#d1fae5",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  confirmationIcon: {
    fontSize: "1.3rem",
    color: "#059669",
  },
  confirmationDismiss: {
    alignSelf: "flex-start",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "1px solid rgba(110, 231, 183, 0.6)",
    background: "rgba(255,255,255,0.6)",
    color: "#047857",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    lineHeight: 1,
  },
  confirmationTitle: {
    margin: 0,
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.15rem",
    color: "#065f46",
    fontWeight: 700,
  },
  confirmationSub: {
    margin: "4px 0 0",
    color: "#047857",
    fontSize: "0.9rem",
  },
  confirmationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  confirmationCell: {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "12px",
    padding: "12px 14px",
    border: "1px solid rgba(110, 231, 183, 0.5)",
  },
  confirmationLabel: {
    display: "block",
    fontSize: "0.72rem",
    color: "#6b7280",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },
  confirmationValue: {
    display: "block",
    color: "#065f46",
    fontSize: "0.95rem",
    lineHeight: 1.4,
  },
  statusBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "999px",
    background: "#d1fae5",
    color: "#065f46",
    fontSize: "0.82rem",
    fontWeight: 700,
    marginTop: "2px",
  },

  /* ── Hero (now compact, single-column) ── */
  hero: {
    background: "rgba(255, 255, 255, 0.88)",
    border: "1px solid rgba(229, 231, 235, 0.9)",
    borderRadius: "24px",
    padding: "28px 32px",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
    marginBottom: "22px",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 11px",
    borderRadius: "999px",
    background: "rgba(239, 246, 255, 0.96)",
    color: "#2563eb",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  title: {
    margin: 0,
    fontFamily: "'Sora', sans-serif",
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)" /* reduced from 3.3rem */,
    lineHeight: 1.1,
    color: "var(--text-h)",
    fontWeight: 800,
  },
  subtitle: {
    marginTop: "10px",
    marginBottom: 0,
    color: "var(--text)",
    fontSize: "0.95rem",
    maxWidth: "60ch",
    lineHeight: 1.6,
  },

  /* ── Layout ── */
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
    gap: "22px",
    alignItems: "start",
  },

  /* ── Form card ── */
  formCard: {
    background: "rgba(255, 255, 255, 0.94)",
    border: "1px solid rgba(229, 231, 235, 0.95)",
    borderRadius: "24px",
    padding: "26px",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  cardTitle: {
    margin: 0,
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.1rem" /* was 1.3rem */,
    fontWeight: 700,
    color: "var(--text-h)",
  },
  cardSub: {
    margin: "5px 0 0",
    color: "var(--text)",
    fontSize: "0.875rem",
  },
  cardBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "0.82rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    color: "var(--text-h)",
    fontSize: "0.83rem" /* tightened */,
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  field: {
    width: "100%",
    minHeight: "46px",
    borderRadius: "12px",
    border: "1px solid #dbe3ee",
    background: "#fff",
    padding: "0 13px",
    color: "var(--text-h)",
    fontSize: "0.92rem",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
  },
  errorBox: {
    marginTop: "14px",
    padding: "11px 13px",
    borderRadius: "12px",
    border: "1px solid var(--error-border)",
    background: "var(--error-bg)",
    color: "#b91c1c",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  emptyState: {
    marginTop: "14px",
    padding: "16px",
    borderRadius: "14px",
    border: "1px dashed #cbd5e1",
    background: "#f8fafc",
    color: "var(--text)",
    fontSize: "0.9rem",
  },
  profileButton: {
    marginTop: "10px",
    minHeight: "40px",
    padding: "0 16px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  secondaryButton: {
    minHeight: "44px",
    padding: "0 18px",
    borderRadius: "12px",
    border: "1px solid #dbe3ee",
    background: "#fff",
    color: "var(--text-h)",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  primaryButton: {
    minHeight: "44px",
    padding: "0 22px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
  },

  /* ── Sidebar ── */
  sideColumn: {
    display: "grid",
    gap: "16px",
  },
  sideCard: {
    background: "rgba(255, 255, 255, 0.94)",
    border: "1px solid rgba(229, 231, 235, 0.95)",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
  },
  vehicleSummary: {
    padding: "14px",
    borderRadius: "14px",
    background: "#f8fbff",
    border: "1px solid #e6eefb",
  },
  vehicleSummaryTitle: {
    display: "block",
    color: "var(--text-h)",
    fontSize: "0.95rem",
    marginBottom: "5px",
    fontWeight: 700,
  },
  vehicleSummaryText: {
    margin: 0,
    color: "var(--text)",
    fontSize: "0.875rem",
  },
  vehicleEmpty: {
    padding: "14px",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "var(--text)",
    fontSize: "0.875rem",
    lineHeight: 1.55,
  },
  stepList: {
    display: "grid",
    gap: "12px",
  },
  stepItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: "26px",
    height: "26px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: 800,
    fontSize: "0.8rem",
    flexShrink: 0,
  },
  stepText: {
    margin: 0,
    color: "var(--text)",
    fontSize: "0.875rem",
    lineHeight: 1.55,
  },
};
