import styles from "../css/ProductModal.module.css";
import "../css/modals.css";
import "../css/cards.css";
import { addToCart, getCart } from "../utils/cart";
import { formatPrice } from "../utils/formatPrice";
import { useEffect, useState } from "react";

function getImageUrl(base, path) {
  if (!path) return "/placeholder.png";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

export default function ProductModal({ product, onClose }) {
  const theme = localStorage.getItem("theme") || "light";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [cart, setCart] = useState(getCart());
  useEffect(() => {
    const updateCart = () => setCart(getCart());
    window.addEventListener("cart-updated", updateCart);
    return () => window.removeEventListener("cart-updated", updateCart);
  }, [product.id]);

  // Для корректного отображения остатка в наличии
  const cartItem = cart.find((item) => item.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const availableQty = product.stockQuantity - cartQty;
  const isOutOfStock = availableQty <= 0;

  const handleAdd = () => {
    if (availableQty > 0) {
      addToCart(product);
    }
  };

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div
        className={`${styles["product-modal"]} ${
          theme === "dark" ? styles.dark : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <img
            src={getImageUrl(API_BASE_URL, product.imageUrl)}
            alt={product.name}
          />
        </div>
        <div className={styles["product-details"]}>
          <h2>{product.name}</h2>
          <ul className={styles["detail-list"]}>
            <li>
              <strong>Цена:</strong> {formatPrice(product.price)} ₽
            </li>
            <li>
              <strong>Категория:</strong> {product.category?.name || "—"}
            </li>
            <li>
              <strong>Описание:</strong> {product.description}
            </li>
            <li>
              <strong>Наличие:</strong>{" "}
              <span
                style={
                  isOutOfStock
                    ? {
                        fontStyle: "italic",
                        color: "gray",
                        fontWeight: "normal",
                      }
                    : availableQty <= 5
                    ? { color: "red", fontWeight: "bold" }
                    : { color: "inherit", fontWeight: "normal" }
                }
              >
                {isOutOfStock ? "Нет в наличии" : `${availableQty} шт.`}
              </span>
            </li>
          </ul>
          <button
            className="btn"
            style={{
              fontSize: "13px",
              padding: "10px 0",
              width: "220px",
              display: "block",
              margin: "20px auto 0 auto",
              background: isOutOfStock ? "#ccc" : undefined,
              color: isOutOfStock ? "#888" : undefined,
              cursor: isOutOfStock ? "not-allowed" : undefined,
            }}
            disabled={isOutOfStock}
            onClick={handleAdd}
          >
            🛒 Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  );
}
