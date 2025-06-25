import { useEffect, useState } from "react";
import "../css/orders-list.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rawUserId = localStorage.getItem("userId");
  const userId =
    rawUserId && !isNaN(Number(rawUserId)) ? Number(rawUserId) : null;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/orders/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки заказов");
        return res.json();
      })
      .then(setOrders)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDownloadReceipt = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}/receipt`);
      if (!res.ok) throw new Error("Ошибка скачивания чека");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    }
  };

  if (!userId)
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Необходимо войти в аккаунт
      </div>
    );
  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>Загрузка...</div>
    );
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        {error.message}
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 1600,
        margin: "40px auto",
        background: "none",
        boxShadow: "none",
        padding: 0,
      }}
    >
      <h2 style={{ textAlign: "left", marginBottom: 32, fontSize: 32, color: "var(--text-main, #222)" }}>
        История заказов
      </h2>
      {orders.length === 0 ? (
        <p style={{ textAlign: "left", color: "var(--text-secondary, #888)", fontSize: 20 }}>
          У вас нет заказов.
        </p>
      ) : (
        <div className="order-cards" style={{ justifyContent: "flex-start" }}>
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-id">Заказ №{order.id}</div>
              <div className="order-date">Дата: {new Date(order.createdAt).toLocaleString()}</div>
              <div className="order-status">Статус: {order.status}</div>
              <div className="order-sum">Сумма: {order.totalPrice} ₽</div>
              <div className="order-products">
                <div className="order-products-title">Товары:</div>
                <ul className="order-products-list">
                  {order.orderedProductDTO?.map((item) => (
                    <li key={item.id}>
                      <span className="order-product-name">{item.product?.name || "Товар"}</span>
                      <span className="order-product-qty">× {item.quantity}</span>
                      <span className="order-product-price">{item.priceAtPurchase} ₽</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="order-receipt-btn"
                onClick={() => handleDownloadReceipt(order.id)}
              >
                Скачать чек
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
