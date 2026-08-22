// Turns an item's priceType + priceMin/priceMax into the exact string to display,
// so every page (catalogue grid, item detail) shows prices the same way.
export function formatPrice(item) {
  const { priceType, priceMin, priceMax } = item;

  switch (priceType) {
    case "fixed":
      return priceMin != null ? `$${priceMin.toFixed(2)}` : "Price unavailable";
    case "range":
      if (priceMin != null && priceMax != null) return `$${priceMin.toFixed(2)} – $${priceMax.toFixed(2)}`;
      return "Price unavailable";
    case "starting_from":
      return priceMin != null ? `Starting from $${priceMin.toFixed(2)}` : "Price unavailable";
    case "contact_for_price":
      return "Contact for Price";
    case "hidden":
      return null; // deliberately show nothing
    default:
      return "Price unavailable";
  }
}

export function primaryImageUrl(item) {
  const primary = item.images?.find((img) => img.isPrimary) || item.images?.[0];
  if (!primary) return null;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace("/api", "");
  return `${base}${primary.filePath}`;
}
