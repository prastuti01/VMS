import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { registerCustomer } from "../services/authService";

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const CarIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M3 9h18" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#10B981"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function RegisterPage() {
  const { login, user, role } = useAuth();
  const navigate = useNavigate();

  // BUG FIX 1: redirect was inverted — Customer was sent to /login instead of dashboard
  useEffect(() => {
    if (user) {
      if (role === "Staff" || role === "Admin") {
        navigate("/staff/register-customer", { replace: true });
      } else {
        // Customer (or any other authenticated role) → their dashboard
        navigate("/customer/dashboard", { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwRules = [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(form.password) },
    { label: "Number", ok: /\d/.test(form.password) },
    { label: "Special character", ok: /[^a-zA-Z\d]/.test(form.password) },
  ];

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (!pwRules.every((r) => r.ok))
      e.password = "Password does not meet requirements";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!form.phone) e.phone = "Phone is required";
    if (!form.address) e.address = "Address is required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      console.log(confirmPassword);
      const res = await registerCustomer(payload);
      login(res.data);
      // BUG FIX 2: was navigating to "/profile" which doesn't exist in the router
      navigate("/customer/dashboard", { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.response?.data ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* RIGHT panel */}
      <div style={s.right}>
        <div style={s.rightInner}>
          <div style={s.bigIcon}>
            <CarIcon />
          </div>
          <div style={s.brandLockup}>
            <h2 style={s.panelTitle}>FleetControl</h2>
            <div style={s.brandDivider} />
            <div style={s.brandSignature}>Drive. Manage. Maintain.</div>
          </div>
          <div style={s.circle1} />
          <div style={s.circle2} />
        </div>
      </div>

      {/* LEFT — Form */}
      <div style={s.left}>
        <div style={s.formWrap}>
          <div className="anim-1" style={s.logoRow}>
            <div style={s.logoBox}>
              <CarIcon />
            </div>
            <span style={s.logoLabel}>FleetControl</span>
          </div>

          <h1 className="anim-2" style={s.heading}>
            Create your account
          </h1>
          <p className="anim-3" style={s.sub}>
            Register as a customer to get started
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ marginTop: "1.75rem" }}
          >
            <div className="anim-3" style={s.fieldWrap}>
              <label style={s.label}>Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
              />
              {errors.email && <span style={s.err}>{errors.email}</span>}
            </div>

            <div
              className="anim-3"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 1rem",
              }}
            >
              <div style={s.fieldWrap}>
                <label style={s.label}>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="98XXXXXXXX"
                  style={{ ...s.input, ...(errors.phone ? s.inputErr : {}) }}
                />
                {errors.phone && <span style={s.err}>{errors.phone}</span>}
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Kathmandu, Nepal"
                  style={{ ...s.input, ...(errors.address ? s.inputErr : {}) }}
                />
                {errors.address && <span style={s.err}>{errors.address}</span>}
              </div>
            </div>

            <div className="anim-4" style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <div style={s.passWrap}>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  style={{
                    ...s.input,
                    paddingRight: "2.8rem",
                    ...(errors.password ? s.inputErr : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={s.eyeBtn}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {form.password && (
                <div style={s.pwRules}>
                  {pwRules.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.75rem",
                        color: r.ok ? "#10B981" : "#9CA3AF",
                      }}
                    >
                      {r.ok ? (
                        <CheckIcon />
                      ) : (
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            display: "inline-block",
                            borderRadius: "50%",
                            border: "1.5px solid #D1D5DB",
                          }}
                        />
                      )}
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <span style={s.err}>{errors.password}</span>}
            </div>

            <div className="anim-5" style={s.fieldWrap}>
              <label style={s.label}>Confirm password</label>
              <div style={s.passWrap}>
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  style={{
                    ...s.input,
                    paddingRight: "2.8rem",
                    ...(errors.confirmPassword ? s.inputErr : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={s.eyeBtn}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={s.err}>{errors.confirmPassword}</span>
              )}
            </div>

            {apiError && <div style={s.apiErr}>{apiError}</div>}

            <button
              className="anim-6"
              type="submit"
              disabled={loading}
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p style={s.switchLine}>
            Already have an account?{" "}
            <Link to="/login" style={s.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    flex: "0 0 55%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: "3rem 2rem",
    order: 2,
  },
  formWrap: { width: "100%", maxWidth: "420px" },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "2rem",
  },
  logoBox: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(30,58,138,0.3)",
  },
  logoLabel: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "800",
    fontSize: "1.3rem",
    color: "#1E3A8A",
    letterSpacing: "-0.02em",
  },
  heading: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#111827",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
  },
  sub: { marginTop: "0.4rem", color: "#6B7280", fontSize: "0.9rem" },
  fieldWrap: { marginBottom: "1.1rem" },
  label: {
    display: "block",
    marginBottom: "0.4rem",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "0.7rem 1rem",
    border: "1.5px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "0.9rem",
    color: "#111827",
    backgroundColor: "#F9FAFB",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  inputErr: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: "0.85rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9CA3AF",
    display: "flex",
    alignItems: "center",
    padding: "2px",
  },
  pwRules: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.35rem",
    marginTop: "0.5rem",
  },
  err: {
    display: "block",
    marginTop: "0.3rem",
    fontSize: "0.78rem",
    color: "#EF4444",
  },
  apiErr: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    borderRadius: "10px",
    padding: "0.7rem 1rem",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  btn: {
    width: "100%",
    padding: "0.8rem",
    marginTop: "0.25rem",
    background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 14px rgba(30,58,138,0.25)",
  },
  switchLine: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#6B7280",
    fontSize: "0.88rem",
  },
  link: { color: "#2563EB", fontWeight: "600", textDecoration: "none" },
  right: {
    flex: "0 0 45%",
    position: "relative",
    overflow: "hidden",
    order: 1,
    background:
      "linear-gradient(145deg, #1E3A8A 0%, #1d4ed8 55%, #14B8A6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rightInner: {
    position: "relative",
    zIndex: 2,
    padding: "3rem 2.5rem",
    color: "#fff",
    maxWidth: "380px",
  },
  bigIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "2rem",
  },
  panelTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "2.65rem",
    fontWeight: "800",
    lineHeight: 1,
    letterSpacing: "-0.03em",
    margin: 0,
  },
  brandLockup: {
    display: "grid",
    gap: "0.85rem",
  },
  brandDivider: {
    width: "72px",
    height: "3px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.78)",
    margin: "0.35rem 0",
  },
  brandSignature: {
    fontSize: "0.95rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.78)",
  },
  circle1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.1)",
    top: "-60px",
    right: "-80px",
    zIndex: 1,
  },
  circle2: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: "-50px",
    left: "-50px",
    zIndex: 1,
  },
};
