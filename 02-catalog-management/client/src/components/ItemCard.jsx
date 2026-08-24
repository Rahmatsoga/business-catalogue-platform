import { Link } from "react-router-dom";
import { formatPrice, primaryImageUrl } from "../utils/priceFormat";
import "./ItemCard.css";

export default function ItemCard({ item }) {
  const price = formatPrice(item);
  const imageUrl = primaryImageUrl(item);

  return (
    <Link to={`/items/${item.slug}`} className="item-card">
      <div className="item-card__image">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} />
        ) : (
          <div className="item-card__image-placeholder">No image</div>
        )}
      </div>
      <div className="item-card__body">
        <div className="item-card__category">{item.categoryId?.name}</div>
        <div className="item-card__name">{item.name}</div>
        {price && <div className="item-card__price">{price}</div>}
        {item.availability === "out_of_stock" && (
          <div className="item-card__availability">Out of Stock</div>
        )}
      </div>
    </Link>
  );
}
