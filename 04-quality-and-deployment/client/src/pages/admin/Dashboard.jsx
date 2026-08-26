import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { admin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    axiosClient.get("/admin/dashboard/summary")
      .then((res) => { setSummary(res.data.data); setLoadState("ready"); })
      .catch(() => setLoadState("error"));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {admin?.name}.</p>

      {loadState === "loading" && <p>Loading summary…</p>}
      {loadState === "error" && <p>Could not load dashboard data.</p>}

      {loadState === "ready" && summary && (
        <>
          <div style={cardsWrapperStyle}>
            <SummaryCard label="Active Items" value={summary.counts.activeItems} />
            <SummaryCard label="Inactive Items" value={summary.counts.inactiveItems} />
            <SummaryCard label="Categories" value={summary.counts.categoryCount} />
            <SummaryCard label="New Inquiries" value={summary.counts.newInquiries} highlight={summary.counts.newInquiries > 0} />
          </div>

          <div style={quickActionsStyle}>
            <Link to="/admin/items/new" style={quickActionLinkStyle}>+ Add Item</Link>
            <Link to="/admin/categories" style={quickActionLinkStyle}>+ Add Category</Link>
            <Link to="/admin/inquiries" style={quickActionLinkStyle}>View Inquiries</Link>
            <Link to="/admin/settings" style={quickActionLinkStyle}>Edit Settings</Link>
          </div>

          <h2 style={{ marginTop: "2rem", fontSize: "1.1rem" }}>Recent Inquiries</h2>
          {summary.recentInquiries.length === 0 ? (
            <p style={{ color: "#64748b" }}>No inquiries yet.</p>
          ) : (
            <div style={recentListStyle}>
              {summary.recentInquiries.map((inquiry) => (
                <Link key={inquiry._id} to="/admin/inquiries" style={recentItemStyle}>
                  <span><strong>{inquiry.customerName}</strong> {inquiry.itemId && `· re: ${inquiry.itemId.name}`}</span>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight }) {
  return (
    <div style={{ ...cardStyle, ...(highlight ? { borderColor: "#0d9488" } : {}) }}>
      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>{value}</div>
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

const quickActionsStyle = {
  display: "flex",
  gap: "0.75rem",
  marginTop: "1.5rem",
  flexWrap: "wrap",
};

const quickActionLinkStyle = {
  background: "#fff",
  border: "1px solid #cbd5e1",
  color: "#0f172a",
  textDecoration: "none",
  padding: "0.55rem 1rem",
  borderRadius: "6px",
  fontSize: "0.85rem",
};

const recentListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  marginTop: "0.75rem",
};

const recentItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "0.6rem 0.9rem",
  textDecoration: "none",
  color: "#0f172a",
  fontSize: "0.88rem",
};
