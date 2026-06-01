import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { login as loginAPI } from "../services/authService";

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

const getRoleRedirect = (role) => {
  if (role === "Customer") return "/customer/dashboard";
  if (role === "Staff") return "/staff/register-customer";
  if (role === "Admin") return "/admin/dashboard";
  return "/login";
};

export default function LoginPage() {
  const { login, user, role } = useAuth();
  const navigate = useNavigate();

  // FIX: spec says "if already logged in, automatically redirected to their
  // dashboard based on role" — LoginPage was missing this guard entirely.
  useEffect(() => {
    if (user && role) {
      navigate(getRoleRedirect(role), { replace: true });
    }
  }, [user, role]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
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
      return; // stops here, no reload, form stays filled
    }
    setLoading(true);
    try {
      const res = await loginAPI(form);
      login(res.data); // writes to localStorage immediately

      // ProtectedRoute now reads localStorage as fallback so no bounce
      navigate(getRoleRedirect(res.data.role), { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.response?.data ||
          "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Form */}
      <div style={s.left}>
        <div style={s.formWrap}>
          <div className="anim-1" style={s.logoRow}>
            <div style={s.logoBox}>
              <CarIcon />
            </div>
            <span style={s.logoLabel}>FleetControl</span>
          </div>

          <h1 className="anim-2" style={s.heading}>
            Welcome back
          </h1>
          <p className="anim-3" style={s.sub}>
            Sign in to your account to continue
          </p>

          <div className="anim-3" style={s.roleBadges}>
            <span style={s.roleBadge}>Customer</span>
            <span style={s.roleBadge}>Staff</span>
            <span style={s.roleBadge}>Admin</span>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ marginTop: "1.5rem" }}
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

            <div className="anim-4" style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <div style={s.passWrap}>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {errors.password && <span style={s.err}>{errors.password}</span>}
            </div>

            {apiError && (
              <div className="anim-4" style={s.apiErr}>
                <span style={s.apiErrIcon}>⚠</span> {apiError}
              </div>
            )}

            <button
              className="anim-5"
              type="submit"
              disabled={loading}
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="anim-6" style={s.switchLine}>
            Don't have an account?{" "}
            <Link to="/register" style={s.link}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT — Decorative panel */}
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
    flex: "0 0 50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: "3rem 2rem",
  },
  formWrap: { width: "100%", maxWidth: "400px" },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "2.5rem",
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
    fontSize: "1.9rem",
    fontWeight: "700",
    color: "#111827",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: 0,
  },
  sub: { marginTop: "0.5rem", color: "#6B7280", fontSize: "0.95rem" },
  roleBadges: { display: "flex", gap: "0.5rem", marginTop: "1rem" },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    color: "#1E3A8A",
    border: "1px solid #BFDBFE",
    borderRadius: "999px",
    padding: "2px 10px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  fieldWrap: { marginBottom: "1.25rem" },
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
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'DM Sans', sans-serif",
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
    padding: "2px",
    display: "flex",
    alignItems: "center",
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
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  apiErrIcon: { fontSize: "1rem" },
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
    letterSpacing: "0.01em",
    boxShadow: "0 4px 14px rgba(30,58,138,0.25)",
    transition: "opacity 0.2s, transform 0.15s",
  },
  switchLine: {
    textAlign: "center",
    marginTop: "1.75rem",
    color: "#6B7280",
    fontSize: "0.88rem",
  },
  link: { color: "#2563EB", fontWeight: "600", textDecoration: "none" },
  right: {
    flex: "0 0 50%",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #1E3A8A 0%, #1d4ed8 55%, #14B8A6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rightInner: {
    position: "relative",
    zIndex: 2,
    padding: "3rem",
    maxWidth: "420px",
    color: "#fff",
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
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.1)",
    top: "-80px",
    right: "-80px",
    zIndex: 1,
  },
  circle2: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: "-60px",
    left: "-60px",
    zIndex: 1,
  },
};
