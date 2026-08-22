import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ItemCard from "../../components/ItemCard";
import "./Catalogue.css";

export default function Catalogue() {
  // useSearchParams keeps search, sort, and filters IN the URL itself,
  // e.g. /catalogue?search=tile&sort=price_asc&page=2 -- so refreshing or
  // sharing the link keeps you on the same view instead of resetting.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "latest";
  const availability = searchParams.get("availability") || "";
  const featured = searchParams.get("featured") || "";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadState, setLoadState] = useState("loading");
  const [searchInput, setSearchInput] = useState(search);
  const [priceMinInput, setPriceMinInput] = useState(priceMin);
  const [priceMaxInput, setPriceMaxInput] = useState(priceMax);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, availability, featured, priceMin, priceMax, page]);

  async function loadItems() {
    setLoadState("loading");
    try {
      const res = await axiosClient.get("/public/items", {
        params: { search, sort, availability, featured, priceMin, priceMax, page },
      });
      setItems(res.data.data);
      setPagination(res.data.pagination);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  function updateParams(updates) {
    const next = {
      search, sort, availability, featured, priceMin, priceMax, page: String(page),
      ...updates,
    };
    // Drop empty values so the URL stays clean (no ?availability=&featured=)
    Object.keys(next).forEach((key) => {
      if (!next[key]) delete next[key];
    });
    setSearchParams(next);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParams({ search: searchInput, page: "1" });
  }

  function handlePriceSubmit(e) {
    e.preventDefault();
    updateParams({ priceMin: priceMinInput, priceMax: priceMaxInput, page: "1" });
  }

  function goToPage(newPage) {
    updateParams({ page: String(newPage) });
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

      <div className="catalogue-filters">
        <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}>
          <option value="latest">Sort: Latest</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <select value={availability} onChange={(e) => updateParams({ availability: e.target.value, page: "1" })}>
          <option value="">All Availability</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="made_to_order">Made to Order</option>
        </select>

        <label className="catalogue-filters__checkbox">
          <input
            type="checkbox"
            checked={featured === "true"}
            onChange={(e) => updateParams({ featured: e.target.checked ? "true" : "", page: "1" })}
          />
          Featured only
        </label>

        <form onSubmit={handlePriceSubmit} className="catalogue-filters__price">
          <input
            type="number"
            min="0"
            placeholder="Min $"
            value={priceMinInput}
            onChange={(e) => setPriceMinInput(e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            placeholder="Max $"
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
          />
          <button type="submit">Apply</button>
        </form>
      </div>

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
