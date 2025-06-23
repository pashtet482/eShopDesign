import { useEffect, useState } from "react";
import { getCart, removeFromCart, clearCart } from "../utils/cart";

function getImageUrl(base, path, placeholder) {
  if (!path) return placeholder ? getImageUrl(base, placeholder) : "/placeholder.png";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

export default function CartPage({ isDark }) {
  const [cart, setCart] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const updateCart = () => setCart(getCart());
    updateCart();
    window.addEventListener("cart-updated", updateCart);
    return () => window.removeEventListener("cart-updated", updateCart);
  }, []);

  const handleRemove = (id) => {
    removeFromCart(id);
    setCart(getCart());
  };

  const handleClear = () => {
    clearCart();
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`cart-page${isDark ? " dark-mode" : ""}`} style={{
      maxWidth: 700,
      margin: "40px auto",
      background: isDark ? "var(--card-bg-dark)" : "#fff",
      color: isDark ? "var(--text-light)" : undefined,
      borderRadius: 16,
      boxShadow: "0 4px 24px #0001",
      padding: 32
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 32, fontSize: 32, letterSpacing: 1 }}>🛒 Ваша корзина</h2>
      {cart.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", fontSize: 20 }}>Корзина пуста.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {cart.map((item) => {
              const imageUrl = getImageUrl(API_BASE_URL, item.imageUrl, item.placeholderImageUrl);
              return (
                <li key={item.id} style={{
                  marginBottom: 24,
                  borderBottom: "1px solid #eee",
                  paddingBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 24
                }}>
                  <img
                    src={imageUrl}
                    alt={item.name}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 20 }}>{item.name}</div>
                    <div style={{ color: "#666", fontSize: 15, margin: "6px 0" }}>{item.category?.name}</div>
                    <div style={{ color: "#888", fontSize: 14 }}>{item.description}</div>
                  </div>
                  <div style={{ minWidth: 120, textAlign: "right" }}>
                    <div style={{ fontWeight: 500, fontSize: 18 }}>{item.price} ₽</div>
                    <div style={{ color: "#888", fontSize: 14 }}>× {item.quantity}</div>
                  </div>
                  <button className="btn" style={{ marginLeft: 16, background: "#e74c3c", color: "#fff" }} onClick={() => handleRemove(item.id)}>
                    Удалить
                  </button>
                </li>
              );
            })}
          </ul>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            fontWeight: "bold",
            fontSize: 22
          }}>
            <span>Итого:</span>
            <span style={{ color: "#27ae60" }}>{total} ₽</span>
          </div>
          <button className="btn" style={{ marginTop: 32, width: "100%", background: "#222", color: "#fff", fontSize: 18, padding: "14px 0", borderRadius: 8 }} onClick={handleClear}>
            Очистить корзину
          </button>
        </>
      )}
    </div>
  );
}
