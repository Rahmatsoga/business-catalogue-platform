export default function Card({ children, style = {} }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
