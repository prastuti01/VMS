import { useState } from "react";
import { updateVehicle, deleteVehicle } from "../services/customerService";
import InputField from "../../../shared/components/InputField";

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

const VehicleCard = ({ vehicle, onRefresh }) => {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    vehicleNumber: vehicle.vehicleNumber,
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const nextErrors = {};

    if (!form.vehicleNumber.trim()) nextErrors.vehicleNumber = "Required";
    if (!form.brand.trim()) nextErrors.brand = "Required";
    if (!form.model.trim()) nextErrors.model = "Required";

    if (!form.year) {
      nextErrors.year = "Required";
    } else if (
      Number.isNaN(Number(form.year)) ||
      Number(form.year) < 1900 ||
      Number(form.year) > new Date().getFullYear() + 1
    ) {
      nextErrors.year = "Enter a valid year";
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setApiError("");

    try {
      await updateVehicle(vehicle.vehicleId, {
        ...form,
        year: parseInt(form.year, 10),
      });

      setEditing(false);
      onRefresh();
    } catch (err) {
      setApiError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Remove ${vehicle.brand} ${vehicle.model}?`,
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteVehicle(vehicle.vehicleId);
      onRefresh();
    } catch {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div style={styles.card}>
        <div style={styles.editHeader}>
          <div>
            <h3 style={styles.editTitle}>Edit Vehicle</h3>
            <p style={styles.editSub}>Update your vehicle information</p>
          </div>
        </div>

        <div style={styles.formGrid}>
          <InputField
            label="Reg. Number"
            value={form.vehicleNumber}
            onChange={(event) =>
              setForm({ ...form, vehicleNumber: event.target.value })
            }
            error={errors.vehicleNumber}
          />

          <InputField
            label="Brand"
            value={form.brand}
            onChange={(event) =>
              setForm({ ...form, brand: event.target.value })
            }
            error={errors.brand}
          />

          <InputField
            label="Model"
            value={form.model}
            onChange={(event) =>
              setForm({ ...form, model: event.target.value })
            }
            error={errors.model}
          />

          <InputField
            label="Year"
            type="number"
            value={form.year}
            onChange={(event) => setForm({ ...form, year: event.target.value })}
            error={errors.year}
          />
        </div>

        {apiError && <div style={styles.apiError}>{apiError}</div>}

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.primaryBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            style={styles.secondaryBtn}
            onClick={() => {
              setEditing(false);
              setErrors({});
              setApiError("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.vehicleBadge}>
          <div style={styles.iconBox}>
            <CarIcon />
          </div>

          <div>
            <h3 style={styles.vehicleName}>
              {vehicle.brand} {vehicle.model}
            </h3>
            <p style={styles.vehicleYear}>{vehicle.year}</p>
          </div>
        </div>

        <span style={styles.regBadge}>{vehicle.vehicleNumber}</span>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Brand</span>
          <strong style={styles.infoValue}>{vehicle.brand}</strong>
        </div>

        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Model</span>
          <strong style={styles.infoValue}>{vehicle.model}</strong>
        </div>

        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Year</span>
          <strong style={styles.infoValue}>{vehicle.year}</strong>
        </div>

        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Reg. No.</span>
          <strong style={styles.infoValue}>{vehicle.vehicleNumber}</strong>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.secondaryBtn}
          onClick={() => setEditing(true)}
        >
          Edit
        </button>

        <button
          type="button"
          style={styles.deleteBtn}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    boxShadow: "0 14px 36px rgba(15, 23, 42, 0.06)",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "14px",
  },

  vehicleBadge: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  vehicleName: {
    margin: "0 0 4px",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "1rem",
    color: "var(--text-h)",
  },

  vehicleYear: {
    margin: 0,
    color: "var(--text)",
    fontSize: "0.84rem",
    fontWeight: "700",
  },

  regBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    color: "#2563eb",
    fontSize: "0.76rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  infoItem: {
    padding: "14px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px solid #edf2f7",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  infoLabel: {
    fontSize: "0.7rem",
    color: "var(--text)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "800",
  },

  infoValue: {
    fontSize: "0.93rem",
    fontWeight: "800",
    color: "var(--text-h)",
    overflowWrap: "anywhere",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    flex: 1,
    minWidth: "120px",
    padding: "11px 14px",
    border: "1px solid #2563eb",
    borderRadius: "12px",
    fontSize: "0.86rem",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    background: "#2563eb",
    color: "#fff",
    boxShadow: "0 10px 22px rgba(37, 99, 235, 0.18)",
  },

  secondaryBtn: {
    flex: 1,
    minWidth: "100px",
    padding: "11px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "0.86rem",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8fafc",
    color: "var(--text-h)",
  },

  deleteBtn: {
    flex: 1,
    minWidth: "100px",
    padding: "11px 14px",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    fontSize: "0.86rem",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff5f5",
    color: "#dc2626",
  },

  editHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
  },

  editTitle: {
    margin: "0 0 5px",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "1rem",
    color: "var(--text-h)",
  },

  editSub: {
    margin: 0,
    color: "var(--text)",
    fontSize: "0.84rem",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "13px",
  },

  apiError: {
    padding: "11px 13px",
    borderRadius: "12px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#dc2626",
    fontSize: "0.84rem",
    fontWeight: "700",
  },
};

export default VehicleCard;
