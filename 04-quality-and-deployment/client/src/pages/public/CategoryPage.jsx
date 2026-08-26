import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ItemCard from "../../components/ItemCard";
import "./Catalogue.css";

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page]);

  async function loadItems() {
    setLoadState("loading");
    try {
      const res = await axiosClient.get("/public/items", { params: { category: slug, page } });
      setItems(res.data.data);
      setPagination(res.data.pagination);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  function goToPage(newPage) {
    setSearchParams({ page: String(newPage) });
  }

  return (
    <div>
      <h1>{items[0]?.categoryId?.name || "Category"}</h1>

      {loadState === "loading" && <p>Loading…</p>}
      {loadState === "error" && <p>Something went wrong. Please try again later.</p>}
      {loadState === "ready" && items.length === 0 && (
        <p style={{ color: "#64748b" }}>No items are available in this category yet.</p>
      )}

      {loadState === "ready" && items.length > 0 && (
        <>
          <div className="catalogue-grid">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          <div className="pagination-bar">
            <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => goToPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
