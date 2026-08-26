import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import CategoryFormModal from "./CategoryFormModal";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [editingCategory, setEditingCategory] = useState(null); // null = closed, {} = create, {...} = edit
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoadState("loading");
    try {
      const res = await axiosClient.get("/admin/categories");
      setCategories(res.data.data);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This cannot be undone. (Categories with linked items or subcategories cannot be deleted.)`
    );
    if (!confirmed) return;

    setActionError("");
    try {
      await axiosClient.delete(`/admin/categories/${category._id}`);
      loadCategories();
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  async function handleToggleActive(category) {
    setActionError("");
    try {
      await axiosClient.put(`/admin/categories/${category._id}`, { isActive: !category.isActive });
      loadCategories();
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  function handleFormSaved() {
    setEditingCategory(null);
    loadCategories();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn-primary" onClick={() => setEditingCategory({})}>
          + Add Category
        </button>
      </div>

      {actionError && <div className="banner banner--error">{actionError}</div>}

      {loadState === "loading" && <p>Loading categories…</p>}
      {loadState === "error" && <p>Could not load categories. Please refresh the page.</p>}

      {loadState === "ready" && categories.length === 0 && (
        <p style={{ color: "#64748b" }}>No categories yet. Click "+ Add Category" to create your first one.</p>
      )}

      {loadState === "ready" && categories.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td className="admin-table__muted">{cat.slug}</td>
                <td>{cat.itemCount}</td>
                <td>
                  <span className={`status-badge ${cat.isActive ? "status-badge--active" : "status-badge--inactive"}`}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="admin-table__actions">
                  <button onClick={() => setEditingCategory(cat)}>Edit</button>
                  <button onClick={() => handleToggleActive(cat)}>
                    {cat.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(cat)} className="admin-table__danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingCategory !== null && (
        <CategoryFormModal
          category={editingCategory}
          allCategories={categories}
          onClose={() => setEditingCategory(null)}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}
