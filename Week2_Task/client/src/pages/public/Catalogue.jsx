import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ItemCard from "../../components/ItemCard";
import "./Catalogue.css";

export default function Catalogue() {
  // useSearchParams keeps the search word and page number IN the URL itself,
  // e.g. /catalogue?search=tile&page=2 -- so refreshing or sharing the link
  // keeps you on the same search/page instead of resetting.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadState, setLoadState] = useState("loading");
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  async function loadItems() {
    setLoadState("loading");
    try {
      const res = await axiosClient.get("/public/items", { params: { search, page } });
      setItems(res.data.data);
      setPagination(res.data.pagination);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchParams({ search: searchInput, page: "1" });
  }

  function goToPage(newPage) {
    setSearchParams({ search, page: String(newPage) });
  }

  return (
    <div>
      <h1>Catalogue</h1>

      <form onSubmit={handleSearchSubmit} className="catalogue-search">
        <input
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loadState === "loading" && <p>Loading…</p>}
      {loadState === "error" && <p>Something went wrong. Please try again later.</p>}

      {loadState === "ready" && items.length === 0 && (
        <p style={{ color: "#64748b" }}>No items match your search.</p>
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
