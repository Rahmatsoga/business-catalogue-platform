import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    axiosClient.get("/public/categories")
      .then((res) => { setCategories(res.data.data); setLoadState("ready"); })
      .catch(() => setLoadState("error"));
  }, []);

  return (
    <div>
      <h1>Categories</h1>

      {loadState === "loading" && <p>Loading…</p>}
      {loadState === "error" && <p>Something went wrong. Please try again later.</p>}
      {loadState === "ready" && categories.length === 0 && (
        <p style={{ color: "#64748b" }}>No categories are available yet.</p>
      )}

      {loadState === "ready" && categories.length > 0 && (
        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/categories/${cat.slug}`} className="category-tile">
              <div className="category-tile__name">{cat.name}</div>
              <div className="category-tile__count">{cat.itemCount} item{cat.itemCount === 1 ? "" : "s"}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
