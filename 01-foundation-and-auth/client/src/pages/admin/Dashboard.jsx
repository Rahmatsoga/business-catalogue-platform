import Card from "../../components/Card";

export default function Dashboard() {
  return (
    <div>
      <h1 style={{ marginBottom: "6px" }}>Dashboard</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
        Summary cards, recent inquiries, and quick actions are built in Week 2/3.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {["Active Items", "Inactive Items", "Categories", "New Inquiries"].map((label) => (
          <Card key={label}>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: 0 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "6px 0 0" }}>—</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
