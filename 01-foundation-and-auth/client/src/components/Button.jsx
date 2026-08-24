export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
}) {
  const baseStyle = {
    padding: "10px 18px",
    borderRadius: "var(--radius-md)",
    fontSize: "15px",
    fontWeight: 600,
    border: "1px solid transparent",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled ? 0.6 : 1,
    transition: "opacity 0.15s ease",
  };

  const variants = {
    primary: {
      backgroundColor: "var(--color-primary)",
      color: "#ffffff",
    },
    secondary: {
      backgroundColor: "transparent",
      color: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
    },
    danger: {
      backgroundColor: "#dc2626",
      color: "#ffffff",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
}
