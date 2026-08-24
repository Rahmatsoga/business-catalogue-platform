export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
}) {
  return (
    <div style={{ marginBottom: "16px", textAlign: "left" }}>
      <label
        htmlFor={name}
        style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}
      >
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${error ? "#dc2626" : "var(--color-border)"}`,
          fontSize: "15px",
        }}
      />
      {error && (
        <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>{error}</p>
      )}
    </div>
  );
}
