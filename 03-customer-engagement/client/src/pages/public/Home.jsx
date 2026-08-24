import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ItemCard from "../../components/ItemCard";
import "./Home.css";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    Promise.all([
      axiosClient.get("/public/categories"),
      axiosClient.get("/public/items", { params: { featured: "true", pageSize: 8 } }),
    ])
      .then(([catRes, itemRes]) => {
        setCategories(catRes.data.data.slice(0, 6));
        setFeaturedItems(itemRes.data.data);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  return (
    <div>
      <section className="home-hero">
        <h1>Welcome to Our Catalogue</h1>
        <p>Browse our products and services below, or use the catalogue to search directly.</p>
        <Link to="/catalogue" className="home-hero__cta">Browse Catalogue</Link>
      </section>

      {loadState === "ready" && categories.length > 0 && (
        <section className="home-section">
          <h2>Categories</h2>
          <div className="home-category-strip">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/categories/${cat.slug}`} className="home-category-chip">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {loadState === "ready" && featuredItems.length > 0 && (
        <section className="home-section">
          <h2>Featured Items</h2>
          <div className="catalogue-grid">
            {featuredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}

      {loadState === "ready" && categories.length === 0 && featuredItems.length === 0 && (
        <p style={{ color: "#64748b" }}>
          No catalogue content has been published yet. Check back soon, or log into the admin
          panel to start adding categories and items.
        </p>
      )}
    </div>
  );
}
