import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Modal.css";

export default function CategoryFormModal({ category, allCategories, onClose, onSaved }) {
  const isEditing = Boolean(category._id);

  const [form, setForm] = useState({
    name: category.name || "",
    description: category.description || "",
    imageUrl: category.imageUrl || "",
    displayOrder: category.displayOrder ?? 0,
    parentId: category.parentId || "",
    isActive: category.isActive ?? true,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = { ...form, parentId: form.parentId || null };

    try {
      if (isEditing) {
        await axiosClient.put(`/admin/categories/${category._id}`, payload);
      } else {
        await axiosClient.post("/admin/categories", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // A category can't be its own parent, and (in this simple MVP) we only allow one level deep,
  // so only top-level categories are offered as possible parents.
  const parentOptions = allCategories.filter((c) => c._id !== category._id && !c.parentId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? "Edit Category" : "Add Category"}</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="banner banner--error">{error}</div>}

          <label htmlFor="cat-name">Name</label>
          <input id="cat-name" value={form.name} onChange={handleChange("name")} required autoFocus />

          <label htmlFor="cat-description">Description</label>
          <textarea id="cat-description" value={form.description} onChange={handleChange("description")} rows={3} />

          <label htmlFor="cat-image">Image URL</label>
          <input id="cat-image" value={form.imageUrl} onChange={handleChange("imageUrl")} placeholder="/uploads/... or https://..." />

          <label htmlFor="cat-parent">Parent Category (optional)</label>
          <select id="cat-parent" value={form.parentId} onChange={handleChange("parentId")}>
            <option value="">— None (top-level) —</option>
            {parentOptions.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <label htmlFor="cat-order">Display Order</label>
          <input id="cat-order" type="number" value={form.displayOrder} onChange={handleChange("displayOrder")} />

          <label className="checkbox-label">
            <input type="checkbox" checked={form.isActive} onChange={handleChange("isActive")} />
            Active (visible on the public website)
          </label>

          <div className="modal-form__actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Saving…" : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
