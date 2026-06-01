import { useState } from "react";
import { FaCar, FaTimes, FaUserPlus } from "react-icons/fa";

import InputField from "../../../shared/components/InputField";

export default function CustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
    address: "",
    vehicleNumber: "",
    brand: "",
    model: "",
    year: "",
  });

  const [includeVehicle, setIncludeVehicle] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const set = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });

  function validate() {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      nextErrors.email = "Enter a valid email";

    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 8)
      nextErrors.password = "Minimum 8 characters";

    if (!form.phone.trim()) nextErrors.phone = "Phone is required";

    if (includeVehicle) {
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
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setApiError("");

    const payload = {
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      ...(includeVehicle
        ? {
            vehicle: {
              vehicleNumber: form.vehicleNumber,
              brand: form.brand,
              model: form.model,
              year: parseInt(form.year, 10),
            },
          }
        : {}),
    };

    try {
      await onSave(payload);
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;

        const firstError = Object.values(validationErrors)[0][0];

        setApiError(firstError);
      } else {
        setApiError(
          error.response?.data?.message || "Customer registration failed.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <div style={styles.iconBox}>
              <FaUserPlus />
            </div>

            <div>
              <h2 style={styles.title}>Add Customer</h2>
              <p style={styles.subtitle}>
                Register a customer and optionally add vehicle details.
              </p>
            </div>
          </div>

          <button type="button" style={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {apiError && <div style={styles.errorBox}>{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Customer Details</h3>

            <div style={styles.grid}>
              <InputField
                label="Email"
                type="email"
                placeholder="customer@email.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />

              <InputField
                label="Phone"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={form.phone}
                onChange={set("phone")}
                error={errors.phone}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
              />

              <InputField
                label="Address"
                placeholder="Customer address"
                value={form.address}
                onChange={set("address")}
              />
            </div>
          </div>

          <div style={styles.toggleBox}>
            <label style={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={includeVehicle}
                onChange={(event) => setIncludeVehicle(event.target.checked)}
                style={styles.checkbox}
              />

              <div>
                <strong style={styles.toggleTitle}>Also add vehicle</strong>
                <p style={styles.toggleText}>
                  Attach vehicle details to this customer now.
                </p>
              </div>
            </label>
          </div>

          {includeVehicle && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <FaCar size={14} />
                Vehicle Details
              </h3>

              <div style={styles.grid}>
                <InputField
                  label="Registration Number"
                  placeholder="BA 1 PA 1234"
                  value={form.vehicleNumber}
                  onChange={set("vehicleNumber")}
                  error={errors.vehicleNumber}
                />

                <InputField
                  label="Brand"
                  placeholder="Toyota"
                  value={form.brand}
                  onChange={set("brand")}
                  error={errors.brand}
                />

                <InputField
                  label="Model"
                  placeholder="Corolla"
                  value={form.model}
                  onChange={set("model")}
                  error={errors.model}
                />

                <InputField
                  label="Year"
                  type="number"
                  placeholder="2022"
                  value={form.year}
                  onChange={set("year")}
                  error={errors.year}
                />
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>

            <button type="submit" style={styles.saveButton} disabled={isSaving}>
              {isSaving ? "Saving..." : "Register Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },

  modal: {
    width: "min(760px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "26px",
    padding: "28px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 35px 80px rgba(15, 23, 42, 0.28)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    marginBottom: "22px",
  },

  titleWrap: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  title: {
    margin: "0 0 5px",
    color: "var(--text-h)",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "900",
    fontSize: "1.35rem",
  },

  subtitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: "0.9rem",
  },

  closeButton: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  errorBox: {
    marginBottom: "18px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.28)",
    color: "#dc2626",
    fontWeight: "800",
    fontSize: "0.88rem",
  },

  section: {
    marginBottom: "20px",
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 14px",
    color: "var(--text-h)",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "900",
    fontSize: "1rem",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },

  toggleBox: {
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },

  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#2563eb",
  },

  toggleTitle: {
    display: "block",
    color: "var(--text-h)",
    fontSize: "0.92rem",
  },

  toggleText: {
    margin: "3px 0 0",
    color: "var(--text)",
    fontSize: "0.82rem",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
    flexWrap: "wrap",
  },

  cancelButton: {
    padding: "12px 20px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    color: "var(--text-h)",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "900",
    cursor: "pointer",
  },

  saveButton: {
    padding: "12px 20px",
    borderRadius: "14px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(37,99,235,0.2)",
  },
};
