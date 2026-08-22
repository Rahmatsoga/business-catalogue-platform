import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./Categories.css";

export default function Items() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  useEffect(() => {
    axiosClient.get("/admin/categories").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, statusFilter, page]);

  async function loadItems() {
    setLoadState("loading");
    try {
      const res = await axiosClient.get("/admin/items", {
        params: { search, category: categoryFilter, status: statusFilter, page },
      });
      setItems(res.data.data);
      setPagination(res.data.pagination);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Delete "${item.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setActionError("");
    try {
      await axiosClient.delete(`/admin/items/${item._id}`);
      loadItems();
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  async function handleToggle(item, field) {
    setActionError("");
    try {
      await axiosClient.patch(`/admin/items/${item._id}/status`, { [field]: !item[field] });
      loadItems();
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Catalogue Items</h1>
        <button className="btn-primary" onClick={() => navigate("/admin/items/new")}>
          + Add Item
        </button>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search name, SKU, tags…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
        />
        <select value={categoryFilter} onChange={(e) => { setPage(1); setCategoryFilter(e.target.value); }}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {actionError && <div className="banner banner--error">{actionError}</div>}

      {loadState === "loading" && <p>Loading items…</p>}
      {loadState === "error" && <p>Could not load items. Please refresh the page.</p>}

      {loadState === "ready" && items.length === 0 && (
        <p style={{ color: "#64748b" }}>No items match your search.</p>
      )}

      {loadState === "ready" && items.length > 0 && (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name} {item.isFeatured && <span className="status-badge status-badge--featured">Featured</span>}</td>
                  <td className="admin-table__muted">{item.sku || "—"}</td>
                  <td>{item.categoryId?.name || "—"}</td>
                  <td>
                    <span className={`status-badge ${item.isActive ? "status-badge--active" : "status-badge--inactive"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="admin-table__actions">
                    <button onClick={() => navigate(`/admin/items/${item._id}/edit`)}>Edit</button>
                    <button onClick={() => handleToggle(item, "isFeatured")}>
                      {item.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                    <button onClick={() => handleToggle(item, "isActive")}>
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(item)} className="admin-table__danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
