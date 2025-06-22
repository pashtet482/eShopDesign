import styles from "../css/ProductModal.module.css";
import "../css/modals.css";
import "../css/cards.css";

export default function ProductModal({ product, onClose }) {
  const theme = localStorage.getItem("theme") || "light";
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div
        className={`${styles["product-modal"]} ${
          theme === "dark" ? styles.dark : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch'}}>
          <img
            src={product.imageUrl === "string" ? "/placeholder.png" : product.imageUrl}
            alt={product.name}
          />
        </div>
        <div className={styles["product-details"]}>
          <h2>{product.name}</h2>
          <ul className={styles["detail-list"]}>
            <li><strong>Цена:</strong> {product.price} ₽</li>
            <li><strong>Категория:</strong> {product.category?.name || "—"}</li>
            <li><strong>Описание:</strong> {product.description}</li>
            <li>
              <strong>Наличие:</strong>{' '}
              <span
                style={isOutOfStock
                  ? { fontStyle: 'italic', color: 'gray', fontWeight: 'normal' }
                  : product.stockQuantity <= 5
                  ? { color: 'red', fontWeight: 'bold' }
                  : { color: 'inherit', fontWeight: 'normal' }
                }
              >
                {isOutOfStock ? 'Нет в наличии' : `${product.stockQuantity} шт.`}
              </span>
            </li>
          </ul>
          <button
            className="btn"
            style={{ fontSize: "13px", padding: "10px 0", width: "220px", display: "block", margin: "20px auto 0 auto", background: isOutOfStock ? '#ccc' : undefined, color: isOutOfStock ? '#888' : undefined, cursor: isOutOfStock ? 'not-allowed' : undefined }}
            disabled={isOutOfStock}
          >
            🛒 Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  );
}
