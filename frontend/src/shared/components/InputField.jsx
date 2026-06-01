const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    textAlign: "left",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid var(--color-border)",
    background: "#ffffff",
    color: "var(--color-text-primary)",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
    boxSizing: "border-box",
    minHeight: "42px",
  },
  error: {
    fontSize: "0.75rem",
    color: "var(--color-error)",
    fontWeight: "600",
    marginTop: "2px",
  },
};

const InputField = ({ label, error, style, ...props }) => (
  <div style={styles.wrapper}>
    {label && <label style={styles.label}>{label}</label>}
    <input
      style={{
        ...styles.input,
        ...(error
          ? { borderColor: "var(--color-error)", background: "#fef2f2" }
          : {}),
        ...style,
      }}
      onFocus={(e) => {
        if (!error) {
          e.target.style.borderColor = "var(--color-secondary)";
          e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)";
        }
      }}
      onBlur={(e) => {
        if (!error) {
          e.target.style.borderColor = "var(--color-border)";
          e.target.style.boxShadow = "none";
        }
      }}
      {...props}
    />
    {error && <span style={styles.error}>{error}</span>}
  </div>
);

export default InputField;
