import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaStar, FaRegCommentDots } from "react-icons/fa";

import Navbar from "../../../shared/components/Navbar";

import { getApiErrorMessage } from "../../../shared/config/api";

import { submitReview, getMyReviews } from "../services/reviewService";

export default function SubmitReviewPage() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getMyReviews();

        if (!mounted) return;

        setReviews(res.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => (mounted = false);
  }, []);

  const handleChange = (e) => {
    setForm((s) => ({
      ...s,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const rating = Number(form.rating);

    if (!rating || rating < 1 || rating > 5) {
      return setError("Rating must be between 1 and 5.");
    }

    if (!form.comment.trim()) {
      return setError("Comment is required.");
    }

    setSubmitting(true);

    try {
      const payload = {
        rating,
        comment: form.comment.trim(),
      };

      const res = await submitReview(payload);

      const created = res.data;

      setReviews((prev) => [created, ...prev]);

      setForm({
        rating: 5,
        comment: "",
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* BACK */}

        <button
          onClick={() => navigate("/customer/dashboard")}
          style={styles.backButton}
        >
          <FaArrowLeft size={12} />
          Back to Dashboard
        </button>

        {/* HERO */}

        <section style={styles.hero}>
          <div style={styles.heroBadge}>
            <FaRegCommentDots size={12} />
            Customer Feedback
          </div>

          <h1 style={styles.heroTitle}>Submit Reviews</h1>

          <p style={styles.heroText}>
            Share your experience about our vehicle services and purchased
            parts.
          </p>
        </section>

        {/* CONTENT */}

        <div style={styles.grid}>
          {/* REVIEW FORM */}

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>New review</h2>

                <p style={styles.cardSubtitle}>
                  Tell us about your experience.
                </p>
              </div>

              <div style={styles.badge}>
                <FaStar size={12} />
                Review
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* RATING */}

              <div style={styles.field}>
                <label style={styles.label}>Rating</label>

                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star
                      {r > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* COMMENT */}

              <div style={styles.field}>
                <label style={styles.label}>Comment</label>

                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe your experience..."
                  style={styles.textarea}
                />
              </div>

              {/* ERROR */}

              {error && <div style={styles.errorBox}>{error}</div>}

              {/* ACTIONS */}

              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.clearButton}
                  onClick={() =>
                    setForm({
                      rating: 5,
                      comment: "",
                    })
                  }
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitButton}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </section>

          {/* REVIEWS */}

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Your reviews</h2>

                <p style={styles.cardSubtitle}>
                  {reviews.length} review
                  {reviews.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div style={styles.badge}>{reviews.length} total</div>
            </div>

            {loading ? (
              <div style={styles.emptyBox}>Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div style={styles.emptyBox}>No reviews submitted yet.</div>
            ) : (
              <div style={styles.reviewList}>
                {reviews.map((r) => (
                  <div key={r.reviewId} style={styles.reviewCard}>
                    <div style={styles.reviewTop}>
                      <div>
                        <div style={styles.reviewRating}>
                          <FaStar
                            size={14}
                            style={{
                              color: "#facc15",
                            }}
                          />
                          {r.rating} / 5
                        </div>

                        <div style={styles.reviewDate}>
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div style={styles.reviewUser}>{r.customerName}</div>
                    </div>

                    <p style={styles.reviewComment}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#f8fbff 0%,#f4f7fb 45%,#f8fafc 100%)",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "24px",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "18px",
    border: "none",
    background: "transparent",
    fontWeight: "700",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "0.9rem",
  },

  hero: {
    background: "#fff",
    borderRadius: "26px",
    padding: "36px",
    border: "1px solid #e5e7eb",
    marginBottom: "24px",
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "0.72rem",
    marginBottom: "18px",
    textTransform: "uppercase",
  },

  heroTitle: {
    fontSize: "2rem",
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: "12px",
    lineHeight: 1,
  },

  heroText: {
    fontSize: "1rem",
    color: "#64748b",
    maxWidth: "700px",
    lineHeight: 1.7,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.15fr",
    gap: "24px",
    alignItems: "start",
  },

  card: {
    background: "#fff",
    borderRadius: "26px",
    padding: "28px",
    border: "1px solid #e5e7eb",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  cardTitle: {
    fontSize: "1.7rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "6px",
  },

  cardSubtitle: {
    color: "#64748b",
    fontSize: "0.95rem",
  },

  badge: {
    padding: "9px 16px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
  },

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "700",
    color: "#0f172a",
    fontSize: "0.95rem",
  },

  select: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #dbeafe",
    fontSize: "0.95rem",
    background: "#fff",
  },

  textarea: {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #dbeafe",
    fontSize: "0.95rem",
    resize: "vertical",
    minHeight: "160px",
  },

  errorBox: {
    padding: "14px",
    borderRadius: "14px",
    background: "#fee2e2",
    color: "#b91c1c",
    marginBottom: "18px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },

  clearButton: {
    padding: "13px 20px",
    borderRadius: "14px",
    border: "1px solid #dbeafe",
    background: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.92rem",
  },

  submitButton: {
    padding: "13px 22px",
    borderRadius: "14px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "0.92rem",
  },

  emptyBox: {
    padding: "24px",
    borderRadius: "18px",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.95rem",
  },

  reviewList: {
    display: "grid",
    gap: "14px",
  },

  reviewCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    background: "#f8fafc",
  },

  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    marginBottom: "12px",
  },

  reviewRating: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "800",
    fontSize: "0.92rem",
    color: "#0f172a",
    marginBottom: "6px",
  },

  reviewDate: {
    color: "#64748b",
    fontSize: "0.82rem",
  },

  reviewUser: {
    padding: "7px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700",
    fontSize: "0.78rem",
  },

  reviewComment: {
    color: "#334155",
    lineHeight: 1.6,
    margin: 0,
    fontSize: "0.92rem",
  },
};
