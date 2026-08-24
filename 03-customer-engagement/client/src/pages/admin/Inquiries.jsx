import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Categories.css";
import "./Inquiries.css";

const STATUS_OPTIONS = ["new", "contacted", "resolved", "spam"];

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadState, setLoadState] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  async function loadInquiries() {
    setLoadState("loading");
    try {
      const res = await axiosClient.get("/admin/inquiries", { params: { status: statusFilter, page } });
      setInquiries(res.data.data);
      setPagination(res.data.pagination);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  async function handleStatusChange(inquiry, newStatus) {
    setActionError("");
    try {
      await axiosClient.patch(`/admin/inquiries/${inquiry._id}/status`, { status: newStatus });
      loadInquiries();
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  async function handleDelete(inquiry) {
    const confirmed = window.confirm(`Delete this inquiry from "${inquiry.customerName}"? This cannot be undone.`);
    if (!confirmed) return;

    setActionError("");
    try {
      await axiosClient.delete(`/admin/inquiries/${inquiry._id}`);
      loadInquiries();
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Inquiries</h1>
      </div>

      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {actionError && <div className="banner banner--error">{actionError}</div>}

      {loadState === "loading" && <p>Loading inquiries…</p>}
      {loadState === "error" && <p>Could not load inquiries. Please refresh the page.</p>}
      {loadState === "ready" && inquiries.length === 0 && (
        <p style={{ color: "#64748b" }}>No inquiries yet.</p>
      )}

      {loadState === "ready" && inquiries.length > 0 && (
        <>
          <div className="inquiry-list">
            {inquiries.map((inquiry) => (
              <div key={inquiry._id} className="inquiry-card">
                <div className="inquiry-card__header" onClick={() => setExpandedId(expandedId === inquiry._id ? null : inquiry._id)}>
                  <div>
                    <span className={`status-badge status-badge--${statusBadgeClass(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                    <strong style={{ marginLeft: "0.6rem" }}>{inquiry.customerName}</strong>
                    {inquiry.itemId && <span className="inquiry-card__item"> · re: {inquiry.itemId.name}</span>}
                  </div>
                  <span className="inquiry-card__date">{new Date(inquiry.createdAt).toLocaleString()}</span>
                </div>

                {expandedId === inquiry._id && (
                  <div className="inquiry-card__body">
                    <p><strong>Contact:</strong> {inquiry.phone || "—"} {inquiry.email && `· ${inquiry.email}`}</p>
                    {inquiry.subject && <p><strong>Subject:</strong> {inquiry.subject}</p>}
                    <p><strong>Message:</strong> {inquiry.message}</p>

                    <div className="inquiry-card__actions">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <button onClick={() => handleDelete(inquiry)} className="admin-table__danger">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pagination-bar">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

function statusBadgeClass(status) {
  if (status === "new") return "featured";
  if (status === "resolved") return "active";
  if (status === "spam") return "inactive";
  return "inactive";
}
