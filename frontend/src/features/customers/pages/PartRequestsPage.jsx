import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRegCalendarAlt,
  FaTools,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
} from "react-icons/fa";
import Navbar from "../../../shared/components/Navbar";
import { getApiErrorMessage } from "../../../shared/config/api";
import {
  createPartRequest,
  getMyPartRequests,
} from "../services/partRequestService";

function FieldLabel({ children }) {
  return <label style={styles.label}>{children}</label>;
}

function StatusBadge({ status }) {
  const color =
    status === "Approved"
      ? { bg: "#d1fae5", text: "#065f46" }
      : status === "Rejected"
        ? { bg: "#fee2e2", text: "#991b1b" }
        : { bg: "#eff6ff", text: "#1e40af" };
  return (
    <span style={{ ...styles.badge, background: color.bg, color: color.text }}>
      {status}
    </span>
  );
}

export default function PartRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ partName: "", description: "" });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMyPartRequests();
        if (!mounted) return;
        setRequests(res.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.partName.trim()) return setError("Part name is required.");
    if (!form.description.trim()) return setError("Description is required.");
    setSubmitting(true);
    try {
      const payload = {
        partName: form.partName,
        description: form.description,
        requestDate: new Date().toISOString(),
        status: "Pending",
      };
      const res = await createPartRequest(payload);
      setRequests((prev) => [res.data, ...prev]);
      setForm({ partName: "", description: "" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
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

        {/* ── Hero ── */}
        <section style={styles.hero}>
          <span style={styles.eyebrow}>Customer Service</span>
          <h1 style={styles.title}>Part Requests</h1>
          <p style={styles.subtitle}>
            Submit a request for parts we don't currently stock, and track its
            status here.
          </p>
        </section>

        {/* ── Layout ── */}
        <section style={styles.layout}>
          {/* ── Form card ── */}
          <form style={styles.formCard} onSubmit={handleSubmit}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>New request</h2>
                <p style={styles.cardSub}>Describe the part you need.</p>
              </div>
              <div style={styles.cardBadge}>
                <FaTools /> Part request
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <FieldLabel>Part name</FieldLabel>
              <input
                name="partName"
                value={form.partName}
                onChange={handleChange}
                placeholder="e.g. Brake Pad, Air Filter…"
                style={styles.field}
              />
            </div>

            <div style={styles.fieldGroup}>
              <FieldLabel>Description</FieldLabel>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide any details, model compatibility, quantity, etc."
                style={{
                  ...styles.field,
                  height: "auto",
                  padding: "12px 14px",
                  resize: "vertical",
                }}
              />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setForm({ partName: "", description: "" })}
                style={styles.secondaryButton}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={styles.primaryButton}
              >
                {submitting ? "Submitting…" : "Request part"}
              </button>
            </div>
          </form>

          {/* ── Requests list ── */}
          <aside style={styles.sideCard}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Your requests</h2>
                <p style={styles.cardSub}>
                  {requests.length > 0
                    ? `${requests.length} request${requests.length !== 1 ? "s" : ""} found`
                    : "No requests yet"}
                </p>
              </div>
              {requests.length > 0 && (
                <div
                  style={{
                    ...styles.cardBadge,
                    background: "#eff6ff",
                    color: "#2563eb",
                  }}
                >
                  {requests.length} total
                </div>
              )}
            </div>

            {loading ? (
              <div style={styles.emptyState}>
                <FaClock style={styles.emptyIcon} />
                <p style={styles.emptyText}>Loading your requests…</p>
              </div>
            ) : requests.length === 0 ? (
              <div style={styles.emptyState}>
                <FaBoxOpen style={styles.emptyIcon} />
                <p style={styles.emptyText}>
                  No part requests yet. Submit one using the form.
                </p>
              </div>
            ) : (
              <ul style={styles.list}>
                {requests.map((r) => (
                  <li key={r.requestId} style={styles.listItem}>
                    <div style={styles.listItemInner}>
                      <div style={styles.listLeft}>
                        <strong style={styles.partName}>{r.partName}</strong>
                        <p style={styles.partDesc}>{r.description}</p>
                        <span style={styles.partDate}>
                          {new Date(r.requestDate).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div style={styles.listRight}>
                        <StatusBadge status={r.status} />
                        <span style={styles.customerName}>
                          {r.customerName}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </section>
      </div>
    </div>
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

  /* ── Hero ── */
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
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
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

  /* ── Two-column layout ── */
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
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
    fontSize: "1.1rem",
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
  fieldGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    color: "var(--text-h)",
    fontSize: "0.83rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  optional: {
    fontWeight: 400,
    color: "var(--text)",
    fontSize: "0.78rem",
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
    fontFamily: "inherit",
  },
  errorBox: {
    marginTop: "2px",
    marginBottom: "14px",
    padding: "11px 13px",
    borderRadius: "12px",
    border: "1px solid var(--error-border)",
    background: "var(--error-bg)",
    color: "#b91c1c",
    fontWeight: 600,
    fontSize: "0.9rem",
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

  /* ── Requests sidebar ── */
  sideCard: {
    background: "rgba(255, 255, 255, 0.94)",
    border: "1px solid rgba(229, 231, 235, 0.95)",
    borderRadius: "24px",
    padding: "26px",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "32px 16px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "1.8rem",
    color: "#94a3b8",
  },
  emptyText: {
    margin: 0,
    color: "var(--text)",
    fontSize: "0.875rem",
    lineHeight: 1.55,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: "10px",
  },
  listItem: {
    background: "#f8fbff",
    border: "1px solid #e6eefb",
    borderRadius: "14px",
    padding: "14px 16px",
  },
  listItemInner: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  listLeft: {
    flex: 1,
    minWidth: 0,
  },
  partName: {
    display: "block",
    color: "var(--text-h)",
    fontSize: "0.95rem",
    fontWeight: 700,
    marginBottom: "4px",
  },
  partDesc: {
    margin: "0 0 6px",
    color: "var(--text)",
    fontSize: "0.85rem",
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  partDate: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    fontWeight: 500,
  },
  listRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    flexShrink: 0,
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  customerName: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    maxWidth: "140px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "right",
  },
};
