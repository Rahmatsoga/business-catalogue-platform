import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { admin } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {admin?.name}.</p>

      <div style={cardsWrapperStyle}>
        <SummaryCardPlaceholder label="Active Items" />
        <SummaryCardPlaceholder label="Inactive Items" />
        <SummaryCardPlaceholder label="Categories" />
        <SummaryCardPlaceholder label="New Inquiries" />
      </div>

      <p style={{ color: "#64748b", marginTop: "1.5rem" }}>
        These counts, plus the recent inquiries list and quick actions, will become live once
        Category, Item, and Inquiry management are built in Weeks 2 and 3.
      </p>
    </div>
  );
}

function SummaryCardPlaceholder({ label }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>—</div>
    </div>
  );
}

const cardsWrapperStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "1rem",
  marginTop: "1.5rem",
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "1rem 1.25rem",
};
