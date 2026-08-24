import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./ItemForm.css";

const emptyForm = {
  name: "",
  categoryId: "",
  sku: "",
  summary: "",
  description: "",
  priceType: "fixed",
  priceMin: "",
  priceMax: "",
  availability: "unspecified",
  tags: "",
  isFeatured: false,
  isActive: true,
};

export default function ItemForm() {
  const { id } = useParams(); // undefined when creating a new item
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [specifications, setSpecifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // only populated once the item is saved (needs an _id to attach images)
  const [loadState, setLoadState] = useState(isEditing ? "loading" : "ready");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    axiosClient.get("/admin/categories").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    axiosClient.get(`/admin/items/${id}`).then((res) => {
      const data = res.data.data;
      setForm({
        name: data.name || "",
        categoryId: data.categoryId?._id || data.categoryId || "",
        sku: data.sku || "",
        summary: data.summary || "",
        description: data.description || "",
        priceType: data.priceType || "fixed",
        priceMin: data.priceMin ?? "",
        priceMax: data.priceMax ?? "",
        availability: data.availability || "unspecified",
        tags: (data.tags || []).join(", "),
        isFeatured: data.isFeatured || false,
        isActive: data.isActive ?? true,
      });
      setSpecifications(data.specifications || []);
      setImages(data.images || []);
      setLoadState("ready");
    }).catch(() => setLoadState("error"));
  }, [id, isEditing]);

  function handleChange(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  function addSpecRow() {
    setSpecifications((prev) => [...prev, { label: "", value: "", displayOrder: prev.length }]);
  }
  function updateSpecRow(index, field, value) {
    setSpecifications((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }
  function removeSpecRow(index) {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      ...form,
      priceMin: form.priceMin === "" ? "" : Number(form.priceMin),
      priceMax: form.priceMax === "" ? "" : Number(form.priceMax),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      specifications: specifications.filter((s) => s.label.trim() && s.value.trim()),
    };

    try {
      if (isEditing) {
        await axiosClient.put(`/admin/items/${id}`, payload);
        navigate("/admin/items");
      } else {
        const res = await axiosClient.post("/admin/items", payload);
        // Redirect into edit mode for the newly created item, so the admin
        // can immediately upload images (images require an existing item id).
        navigate(`/admin/items/${res.data.data._id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      const res = await axiosClient.post(`/admin/items/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages(res.data.data.images);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Image upload failed. Please check the file and try again.");
    } finally {
      e.target.value = ""; // allow re-selecting the same file if needed
    }
  }

  async function handleSetPrimary(imageId) {
    const res = await axiosClient.patch(`/admin/items/${id}/images/${imageId}/primary`);
    setImages(res.data.data.images);
  }

  async function handleDeleteImage(imageId) {
    const res = await axiosClient.delete(`/admin/items/${id}/images/${imageId}`);
    setImages(res.data.data.images);
  }

  if (loadState === "loading") return <p>Loading item…</p>;
  if (loadState === "error") return <p>Could not load this item.</p>;

  return (
    <div>
      <h1>{isEditing ? "Edit Item" : "Add Item"}</h1>

      <form className="item-form" onSubmit={handleSubmit}>
        {error && <div className="banner banner--error">{error}</div>}

        <fieldset>
          <legend>Core Details</legend>

          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={handleChange("name")} required />

          <label htmlFor="categoryId">Category</label>
          <select id="categoryId" value={form.categoryId} onChange={handleChange("categoryId")} required>
            <option value="">— Select a category —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <label htmlFor="sku">SKU (optional, must be unique)</label>
          <input id="sku" value={form.sku} onChange={handleChange("sku")} />

          <label htmlFor="summary">Short Summary</label>
          <input id="summary" value={form.summary} onChange={handleChange("summary")} placeholder="One line shown on the catalogue grid" />

          <label htmlFor="description">Full Description</label>
          <textarea id="description" value={form.description} onChange={handleChange("description")} rows={4} />

          <label htmlFor="tags">Tags (comma-separated)</label>
          <input id="tags" value={form.tags} onChange={handleChange("tags")} placeholder="matte, white, ceramic" />
        </fieldset>

        <fieldset>
          <legend>Pricing</legend>

          <label htmlFor="priceType">Price Type</label>
          <select id="priceType" value={form.priceType} onChange={handleChange("priceType")}>
            <option value="fixed">Fixed Price</option>
            <option value="range">Price Range</option>
            <option value="starting_from">Starting From</option>
            <option value="contact_for_price">Contact for Price</option>
            <option value="hidden">Hidden</option>
          </select>

          {(form.priceType === "fixed" || form.priceType === "starting_from") && (
            <>
              <label htmlFor="priceMin">Price</label>
              <input id="priceMin" type="number" min="0" step="0.01" value={form.priceMin} onChange={handleChange("priceMin")} />
            </>
          )}

          {form.priceType === "range" && (
            <>
              <label htmlFor="priceMin">Minimum Price</label>
              <input id="priceMin" type="number" min="0" step="0.01" value={form.priceMin} onChange={handleChange("priceMin")} />
              <label htmlFor="priceMax">Maximum Price</label>
              <input id="priceMax" type="number" min="0" step="0.01" value={form.priceMax} onChange={handleChange("priceMax")} />
            </>
          )}

          <label htmlFor="availability">Availability</label>
          <select id="availability" value={form.availability} onChange={handleChange("availability")}>
            <option value="unspecified">Unspecified</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="made_to_order">Made to Order</option>
          </select>
        </fieldset>

        <fieldset>
          <legend>Specifications</legend>
          {specifications.map((spec, index) => (
            <div key={index} className="spec-row">
              <input
                placeholder="Label (e.g. Color)"
                value={spec.label}
                onChange={(e) => updateSpecRow(index, "label", e.target.value)}
              />
              <input
                placeholder="Value (e.g. Matte White)"
                value={spec.value}
                onChange={(e) => updateSpecRow(index, "value", e.target.value)}
              />
              <button type="button" onClick={() => removeSpecRow(index)} className="admin-table__danger">Remove</button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addSpecRow} style={{ alignSelf: "flex-start" }}>
            + Add Specification
          </button>
        </fieldset>

        <fieldset>
          <legend>Visibility</legend>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.isFeatured} onChange={handleChange("isFeatured")} />
            Featured (shown in featured sections)
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.isActive} onChange={handleChange("isActive")} />
            Active (visible on the public website)
          </label>
        </fieldset>

        <div className="modal-form__actions">
          <button type="button" className="btn-secondary" onClick={() => navigate("/admin/items")}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Create Item"}
          </button>
        </div>
      </form>

      {isEditing && (
        <fieldset className="image-section">
          <legend>Images</legend>

          {uploadError && <div className="banner banner--error">{uploadError}</div>}

          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} />
          <p style={{ fontSize: "0.8rem", color: "#64748b" }}>JPEG, PNG, or WebP. Max 5MB each.</p>

          <div className="image-grid">
            {images.map((img) => (
              <div key={img._id} className="image-tile">
                <img src={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${img.filePath}`} alt={img.altText} />
                {img.isPrimary && <span className="status-badge status-badge--active image-tile__badge">Primary</span>}
                <div className="image-tile__actions">
                  {!img.isPrimary && (
                    <button type="button" onClick={() => handleSetPrimary(img._id)}>Set Primary</button>
                  )}
                  <button type="button" onClick={() => handleDeleteImage(img._id)} className="admin-table__danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {!isEditing && (
        <p style={{ color: "#64748b", marginTop: "1rem" }}>
          Save the item first to unlock image uploads.
        </p>
      )}
    </div>
  );
}
