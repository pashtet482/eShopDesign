import { useEffect, useState } from "react";

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
    fetch(`/orders/${userId}`)
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
      const res = await fetch(`/orders/${id}/receipt`);
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
        maxWidth: 800,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px #0001",
        padding: 32,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 32, fontSize: 32 }}>
        История заказов
      </h2>
      {orders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", fontSize: 20 }}>
          У вас нет заказов.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orders.map((order) => (
            <li
              key={order.id}
              style={{
                marginBottom: 24,
                paddingBottom: 18,
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 20 }}>
                Заказ №{order.id}
              </div>
              <div style={{ color: "#888", fontSize: 15, margin: "6px 0" }}>
                Дата: {new Date(order.createdAt).toLocaleString()}
              </div>
              <div style={{ color: "#888", fontSize: 15, margin: "6px 0" }}>
                Статус: {order.status}
              </div>
              <div style={{ color: "#888", fontSize: 15, margin: "6px 0" }}>
                Сумма: {order.totalPrice} ₽
              </div>
              <div style={{ margin: "8px 0" }}>
                Товары:
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {order.orderedProductDTO?.map((item) => (
                    <li key={item.id}>
                      {item.product?.name || "Товар"} × {item.quantity} —{" "}
                      {item.priceAtPurchase} ₽
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="btn"
                style={{
                  background: "#d32f2f",
                  color: "#fff",
                  fontWeight: 600,
                }}
                onClick={() => handleDownloadReceipt(order.id)}
              >
                Скачать чек
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
