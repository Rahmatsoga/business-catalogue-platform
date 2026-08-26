import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ItemCard from "../../components/ItemCard";
import InquiryForm from "../../components/InquiryForm";
import WhatsAppButton from "../../components/WhatsAppButton";
import { useBusinessSettings } from "../../context/BusinessSettingsContext";
import { formatPrice } from "../../utils/priceFormat";
import "../../components/WhatsAppButton.css";
import "./ItemDetail.css";

const API_FILE_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace("/api", "");

export default function ItemDetail() {
  const { slug } = useParams();
  const { settings } = useBusinessSettings();

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loadState, setLoadState] = useState("loading");
  const [copyState, setCopyState] = useState("idle"); // idle | copied

  useEffect(() => {
    setLoadState("loading");
    setActiveImageIndex(0);
    axiosClient
      .get(`/public/items/${slug}`)
      .then((res) => {
        setItem(res.data.data.item);
        setRelatedItems(res.data.data.relatedItems);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, [slug]);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    });
  }

  if (loadState === "loading") return <p>Loading…</p>;
  if (loadState === "error" || !item) {
    return (
      <div>
        <h1>Item Not Found</h1>
        <p>The requested item could not be found.</p>
        <Link to="/catalogue">Back to Catalogue</Link>
      </div>
    );
  }

  const price = formatPrice(item);
  const images = item.images?.length > 0 ? item.images : [];
  const activeImage = images[activeImageIndex];

  return (
    <div>
      <div className="item-detail">
        <div className="item-detail__gallery">
          <div className="item-detail__main-image">
            {activeImage ? (
              <img src={`${API_FILE_BASE}${activeImage.filePath}`} alt={activeImage.altText || item.name} />
            ) : (
              <div className="item-detail__image-placeholder">No image available</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="item-detail__thumbnails">
              {images.map((img, index) => (
                <button
                  key={img._id}
                  className={`item-detail__thumb ${index === activeImageIndex ? "item-detail__thumb--active" : ""}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={`${API_FILE_BASE}${img.filePath}`} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="item-detail__info">
          <div className="item-detail__category">{item.categoryId?.name}</div>
          <h1>{item.name}</h1>
          {item.sku && <div className="item-detail__sku">SKU: {item.sku}</div>}
          {price && <div className="item-detail__price">{price}</div>}

          {item.availability !== "unspecified" && (
            <div className={`item-detail__availability item-detail__availability--${item.availability}`}>
              {formatAvailability(item.availability)}
            </div>
          )}

          {item.summary && <p className="item-detail__summary">{item.summary}</p>}
          {item.description && <p className="item-detail__description">{item.description}</p>}

          {item.specifications?.length > 0 && (
            <div className="item-detail__specs">
              <h3>Specifications</h3>
              <table>
                <tbody>
                  {item.specifications.map((spec, i) => (
                    <tr key={i}>
                      <td className="item-detail__spec-label">{spec.label}</td>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FR-020 WhatsApp inquiry, FR-019 share, FR-022 item inquiry form */}
          <div className="item-detail__actions">
            {settings?.whatsappNumber && (
              <WhatsAppButton
                whatsappNumber={settings.whatsappNumber}
                message={`Hi, I'm interested in "${item.name}" (SKU: ${item.sku || "N/A"}). ${window.location.href}`}
              />
            )}
            <button type="button" className="item-detail__copy-link" onClick={handleCopyLink}>
              {copyState === "copied" ? "Link Copied!" : "Copy Link"}
            </button>
          </div>

          <div className="item-detail__inquiry">
            <h3>Ask About This Item</h3>
            <InquiryForm itemId={item._id} itemName={item.name} />
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <div className="item-detail__related">
          <h2>Related Items</h2>
          <div className="catalogue-grid">
            {relatedItems.map((related) => (
              <ItemCard key={related._id} item={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatAvailability(value) {
  const labels = {
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
    made_to_order: "Made to Order",
  };
  return labels[value] || value;
}
