import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/Navbar";
import VehicleCard from "../components/VehicleCard";
import InputField from "../../../shared/components/InputField";
import {
  getProfile,
  updateProfile,
  addVehicle,
  deleteAccount,
} from "../services/customerService";
import { useAuth } from "../../../context/AuthContext";

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

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", address: "" });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");

  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: "",
    brand: "",
    model: "",
    year: "",
  });
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleSuccess, setVehicleSuccess] = useState("");
  const [vehicleApiError, setVehicleApiError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setEditForm({
        phone: res.data.phone || "",
        address: res.data.address || "",
      });
    } catch {
      setApiError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  const validateEdit = () => {
    const errors = {};

    if (!editForm.phone.trim()) errors.phone = "Phone is required";
    if (!editForm.address.trim()) errors.address = "Address is required";

    return errors;
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const errors = validateEdit();

    if (Object.keys(errors).length) {
      setEditErrors(errors);
      return;
    }

    setEditLoading(true);

    try {
      await updateProfile(editForm);
      setEditSuccess("Profile updated successfully.");
      setEditMode(false);
      fetchProfile();
      setTimeout(() => setEditSuccess(""), 3000);
    } catch (err) {
      setEditErrors({
        api: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const validateVehicle = () => {
    const errors = {};

    if (!vehicleForm.vehicleNumber.trim()) errors.vehicleNumber = "Required";
    if (!vehicleForm.brand.trim()) errors.brand = "Required";
    if (!vehicleForm.model.trim()) errors.model = "Required";

    if (!vehicleForm.year) {
      errors.year = "Required";
    } else if (
      Number.isNaN(Number(vehicleForm.year)) ||
      Number(vehicleForm.year) < 1900 ||
      Number(vehicleForm.year) > new Date().getFullYear() + 1
    ) {
      errors.year = "Enter a valid year";
    }

    return errors;
  };

  const handleAddVehicle = async (event) => {
    event.preventDefault();

    const errors = validateVehicle();

    if (Object.keys(errors).length) {
      setVehicleErrors(errors);
      return;
    }

    setVehicleLoading(true);
    setVehicleApiError("");

    try {
      await addVehicle({
        ...vehicleForm,
        year: parseInt(vehicleForm.year, 10),
      });

      setVehicleSuccess("Vehicle added successfully.");
      setShowVehicleForm(false);
      setVehicleForm({
        vehicleNumber: "",
        brand: "",
        model: "",
        year: "",
      });
      fetchProfile();
      setTimeout(() => setVehicleSuccess(""), 3000);
    } catch (err) {
      setVehicleApiError(
        err.response?.data?.message || "Failed to add vehicle.",
      );
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      await deleteAccount();
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Failed to delete account. Please try again.",
      );
    }
  };

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
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 22px rgba(37, 99, 235, 0.08)",
      transition: "all 0.2s ease",
    },
    pageTitle: {
      fontFamily: "'Sora', sans-serif",
      fontWeight: "800",
      fontSize: "2.15rem",
      color: "var(--text-h)",
      margin: "0",
    },
    subtitle: {
      color: "var(--text)",
      marginTop: "8px",
      marginBottom: "28px",
      fontSize: "0.98rem",
    },
    card: {
      background: "rgba(255, 255, 255, 0.92)",
      border: "1px solid #e5e7eb",
      borderRadius: "24px",
      padding: "28px",
      marginBottom: "24px",
      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "18px",
      marginBottom: "24px",
    },
    sectionTitle: {
      fontFamily: "'Sora', sans-serif",
      fontWeight: "800",
      fontSize: "1.15rem",
      color: "var(--text-h)",
      margin: "0 0 6px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    sectionSubtext: {
      color: "var(--text)",
      margin: 0,
      fontSize: "0.9rem",
    },
    accent: {
      width: "5px",
      height: "22px",
      background: "var(--accent)",
      borderRadius: "999px",
      display: "inline-block",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "16px",
    },
    infoItem: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      padding: "18px",
      background: "#f8fafc",
      border: "1px solid #edf2f7",
      borderRadius: "18px",
    },
    infoLabel: {
      fontSize: "0.74rem",
      color: "var(--text)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: "700",
    },
    infoValue: {
      fontSize: "1rem",
      fontWeight: "800",
      color: "var(--text-h)",
      overflowWrap: "anywhere",
    },
    editForm: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "16px",
    },
    btnRow: {
      display: "flex",
      gap: "12px",
      marginTop: "4px",
      flexWrap: "wrap",
    },
    btn: (primary) => ({
      padding: "11px 20px",
      borderRadius: "12px",
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: "800",
      fontSize: "0.9rem",
      cursor: "pointer",
      border: "1.5px solid",
      transition: "all 0.2s",
      ...(primary
        ? {
            background: "var(--accent)",
            color: "#fff",
            borderColor: "var(--accent)",
            boxShadow: "0 12px 25px rgba(37, 99, 235, 0.18)",
          }
        : {
            background: "#f8fafc",
            color: "var(--text-h)",
            borderColor: "#e5e7eb",
          }),
    }),
    editTrigger: {
      padding: "10px 18px",
      borderRadius: "12px",
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: "800",
      fontSize: "0.88rem",
      cursor: "pointer",
      border: "1px solid #dbeafe",
      background: "#eff6ff",
      color: "#2563eb",
      transition: "all 0.2s",
    },
    vehiclesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "16px",
    },
    addVehicleBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "9px",
      padding: "12px 18px",
      border: "1.5px dashed #93c5fd",
      borderRadius: "14px",
      background: "#eff6ff",
      color: "#2563eb",
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: "800",
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    emptyVehicleBox: {
      padding: "36px 18px",
      marginBottom: "16px",
      textAlign: "center",
      border: "1.5px dashed #bfdbfe",
      borderRadius: "20px",
      background: "#f8fbff",
      color: "var(--text)",
    },
    vehicleForm: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginTop: "4px",
      padding: "20px",
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      borderRadius: "18px",
    },
    success: {
      background: "rgba(16,185,129,0.1)",
      border: "1px solid rgba(16,185,129,0.3)",
      borderRadius: "14px",
      padding: "12px 15px",
      color: "#059669",
      fontWeight: "700",
      fontSize: "0.88rem",
    },
    apiErr: {
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.28)",
      borderRadius: "14px",
      padding: "12px 15px",
      color: "#dc2626",
      fontWeight: "700",
      fontSize: "0.88rem",
    },
    dangerCard: {
      background: "#fff7f7",
      border: "1px solid #fecaca",
      borderRadius: "24px",
      padding: "28px",
      marginBottom: "24px",
      boxShadow: "0 18px 45px rgba(239, 68, 68, 0.05)",
    },
    dangerHeader: {
      display: "flex",
      justifyContent: "space-between",
      gap: "18px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    dangerBtn: {
      padding: "12px 20px",
      borderRadius: "14px",
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: "800",
      fontSize: "0.88rem",
      cursor: "pointer",
      border: "1.5px solid #ef4444",
      background: "#ef4444",
      color: "#fff",
      transition: "all 0.2s",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div
          style={{
            ...styles.content,
            textAlign: "center",
            paddingTop: "90px",
            color: "var(--text)",
            fontWeight: 700,
          }}
        >
          Loading profile…
        </div>
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

        <h1 style={styles.pageTitle} className="anim-1">
          My Profile
        </h1>
        <p style={styles.subtitle}>
          Manage your account information and registered vehicles.
        </p>

        {apiError && (
          <div style={{ ...styles.apiErr, marginBottom: "16px" }}>
            {apiError}
          </div>
        )}

        {editSuccess && (
          <div style={{ ...styles.success, marginBottom: "16px" }}>
            {editSuccess}
          </div>
        )}

        <section style={styles.card} className="anim-2">
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <span style={styles.accent} />
                Account Details
              </h2>
              <p style={styles.sectionSubtext}>
                Your personal contact and account information.
              </p>
            </div>

            {!editMode && (
              <button
                style={styles.editTrigger}
                type="button"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <form
              style={styles.editForm}
              onSubmit={handleEditSubmit}
              noValidate
            >
              <div style={styles.formRow}>
                <InputField
                  label="Phone"
                  value={editForm.phone}
                  onChange={(event) =>
                    setEditForm({ ...editForm, phone: event.target.value })
                  }
                  error={editErrors.phone}
                />

                <InputField
                  label="Address"
                  value={editForm.address}
                  onChange={(event) =>
                    setEditForm({ ...editForm, address: event.target.value })
                  }
                  error={editErrors.address}
                />
              </div>

              {editErrors.api && (
                <div style={styles.apiErr}>{editErrors.api}</div>
              )}

              <div style={styles.btnRow}>
                <button
                  type="submit"
                  style={styles.btn(true)}
                  disabled={editLoading}
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>

                <button
                  type="button"
                  style={styles.btn(false)}
                  onClick={() => {
                    setEditMode(false);
                    setEditErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{profile?.email}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>{profile?.phone || "—"}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Address</span>
                <span style={styles.infoValue}>{profile?.address || "—"}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Member Since</span>
                <span style={styles.infoValue}>
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </section>

        <section style={styles.card} className="anim-3">
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <span style={styles.accent} />
                My Vehicles ({profile?.vehicles?.length ?? 0})
              </h2>
              <p style={styles.sectionSubtext}>
                Add and manage your registered vehicles.
              </p>
            </div>
          </div>

          {vehicleSuccess && (
            <div style={{ ...styles.success, marginBottom: "16px" }}>
              {vehicleSuccess}
            </div>
          )}

          {profile?.vehicles?.length > 0 ? (
            <div style={{ ...styles.vehiclesGrid, marginBottom: "18px" }}>
              {profile.vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.vehicleId}
                  vehicle={vehicle}
                  onRefresh={fetchProfile}
                />
              ))}
            </div>
          ) : (
            <div style={styles.emptyVehicleBox}>
              No vehicles registered yet. Add your first vehicle below.
            </div>
          )}

          {showVehicleForm ? (
            <form
              style={styles.vehicleForm}
              onSubmit={handleAddVehicle}
              noValidate
            >
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: "800",
                  fontSize: "1rem",
                  color: "var(--text-h)",
                }}
              >
                Add New Vehicle
              </div>

              <div style={styles.formRow}>
                <InputField
                  label="Registration Number"
                  placeholder="BA 1 PA 1234"
                  value={vehicleForm.vehicleNumber}
                  onChange={(event) =>
                    setVehicleForm({
                      ...vehicleForm,
                      vehicleNumber: event.target.value,
                    })
                  }
                  error={vehicleErrors.vehicleNumber}
                />

                <InputField
                  label="Brand"
                  placeholder="Toyota"
                  value={vehicleForm.brand}
                  onChange={(event) =>
                    setVehicleForm({
                      ...vehicleForm,
                      brand: event.target.value,
                    })
                  }
                  error={vehicleErrors.brand}
                />

                <InputField
                  label="Model"
                  placeholder="Corolla"
                  value={vehicleForm.model}
                  onChange={(event) =>
                    setVehicleForm({
                      ...vehicleForm,
                      model: event.target.value,
                    })
                  }
                  error={vehicleErrors.model}
                />

                <InputField
                  label="Year"
                  type="number"
                  placeholder="2022"
                  value={vehicleForm.year}
                  onChange={(event) =>
                    setVehicleForm({
                      ...vehicleForm,
                      year: event.target.value,
                    })
                  }
                  error={vehicleErrors.year}
                />
              </div>

              {vehicleApiError && (
                <div style={styles.apiErr}>{vehicleApiError}</div>
              )}

              <div style={styles.btnRow}>
                <button
                  type="submit"
                  style={styles.btn(true)}
                  disabled={vehicleLoading}
                >
                  {vehicleLoading ? "Adding…" : "Add Vehicle"}
                </button>

                <button
                  type="button"
                  style={styles.btn(false)}
                  onClick={() => {
                    setShowVehicleForm(false);
                    setVehicleErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              style={styles.addVehicleBtn}
              type="button"
              onClick={() => setShowVehicleForm(true)}
            >
              <PlusIcon />
              Add Vehicle
            </button>
          )}
        </section>

        <section style={styles.dangerCard} className="anim-4">
          <div style={styles.dangerHeader}>
            <div>
              <h2
                style={{
                  ...styles.sectionTitle,
                  color: "#dc2626",
                  marginBottom: "8px",
                }}
              >
                <span style={{ ...styles.accent, background: "#ef4444" }} />
                Danger Zone
              </h2>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#7f1d1d",
                  margin: 0,
                }}
              >
                Deleting your account is permanent and cannot be undone.
              </p>
            </div>

            <button
              style={styles.dangerBtn}
              type="button"
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
