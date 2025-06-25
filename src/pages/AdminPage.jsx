import { useEffect, useState } from "react";
import "../css/base.css";
import "../css/layout.css";
import "../css/orders-list.css";
import "../css/admin-panel.css";

const TABLES = [
  { key: "products", label: "Товары" },
  { key: "categories", label: "Категории" },
  { key: "users", label: "Пользователи" },
  { key: "orders", label: "Заказы" },
];

function AdminModal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <button className="admin-modal-close" onClick={onClose}>
          &times;
        </button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function AdminPage() {
  const [activeTable, setActiveTable] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRows, setEditRows] = useState({}); // Для редактирования
  const [filter, setFilter] = useState("");
  const [orderStatusDraft, setOrderStatusDraft] = useState({});
  const [modal, setModal] = useState({ open: false, type: null });
  const [modalData, setModalData] = useState({});
  // --- добавлено для загрузки изображения ---
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const uploadProductImage = async (file) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/products/product-image", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      return await res.text();
    } else {
      const errorText = await res.text();
      console.error("Ошибка при загрузке:", errorText);
      alert("Ошибка при загрузке изображения");
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTable === "products") {
      fetch("/products/products")
        .then((r) => r.json())
        .then(setProducts)
        .finally(() => setLoading(false));
      fetch("/categories/get-all-categories")
        .then((r) => r.json())
        .then(setCategories);
    } else if (activeTable === "categories") {
      fetch("/categories/get-all-categories")
        .then((r) => r.json())
        .then(setCategories)
        .finally(() => setLoading(false));
    } else if (activeTable === "users") {
      fetch("/users")
        .then((r) => r.json())
        .then(setUsers)
        .finally(() => setLoading(false));
    } else if (activeTable === "orders") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then(setOrders)
        .finally(() => setLoading(false));
    }
  }, [activeTable]);

  // CRUD-заготовки (реализуйте API)
  const handleAdd = () => {
    /* ... */
  };
  const handleEdit = (id, field, value) => {
    /* ... */
  };
  const handleDelete = (id) => {
    /* ... */
  };
  const handleSave = () => {
    /* ... */
  };

  // Для orders: смена статуса заказа
  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrderStatusDraft((prev) => ({ ...prev, [orderId]: newStatus }));
  };
  const handleOrderStatusSave = (orderId) => {
    // TODO: отправить PATCH/PUT на сервер
    // fetch(`/api/orders/${orderId}/status`, ...)
  };

  const openAddModal = (type) => {
    setModal({ open: true, type });
    setModalData({});
  };
  const closeModal = () => setModal({ open: false, type: null });

  // Добавление товара с автоматической загрузкой изображения
  const handleAddProduct = async (data) => {
    setLoading(true);
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadProductImage(file);
    }
    await fetch("/products/create-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, imageUrl }),
    });
    setModal({ open: false, type: null });
    setFile(null);
    setImagePreview("");
    // Обновить список
    fetch("/products/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  };
  // Удаление товара
  const handleDeleteProduct = async (id) => {
    setLoading(true);
    await fetch(`/products/delete-product/${id}`, { method: "DELETE" });
    fetch("/products/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  };
  // Добавление категории
  const handleAddCategory = async (data) => {
    setLoading(true);
    await fetch("/categories/create-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setModal({ open: false, type: null });
    fetch("/categories/get-all-categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };
  // Удаление категории
  const handleDeleteCategory = async (name) => {
    setLoading(true);
    await fetch(`/categories/delete-category`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetch("/categories/get-all-categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ display: "flex", minHeight: "80vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "var(--background-secondary, #f9f9f9)",
          borderRight: "1px solid #eee",
          padding: 24,
        }}
      >
        <h3 style={{ marginBottom: 24 }}>Админ-панель</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {TABLES.map((t) => (
            <li key={t.key}>
              <button
                style={{
                  width: "100%",
                  background: activeTable === t.key ? "#d32f2f" : "transparent",
                  color:
                    activeTable === t.key ? "#fff" : "var(--text-main, #222)",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 0",
                  marginBottom: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background .2s",
                }}
                onClick={() => setActiveTable(t.key)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* Content */}
      <main style={{ flex: 1, padding: 32 }}>
        {loading ? (
          <div>Загрузка...</div>
        ) : activeTable === "products" ? (
          <div>
            <h2>Товары</h2>
            <div
              style={{
                margin: "16px 0",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <input
                placeholder="Фильтр по названию..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  minWidth: 220,
                }}
              />
              <button
                className="admin-btn"
                style={{ minWidth: 140 }}
                onClick={() => openAddModal("product")}
              >
                Добавить товар
              </button>
              <button
                className="admin-btn"
                style={{ minWidth: 170 }}
                onClick={handleSave}
              >
                Сохранить изменения
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Описание</th>
                  <th>Цена</th>
                  <th>В наличии</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) =>
                    p.name.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>
                        <select
                          value={p.category?.id || ""}
                          onChange={(e) =>
                            handleEdit(p.id, "categoryId", e.target.value)
                          }
                        >
                          <option value="">---</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{p.description}</td>
                      <td>
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) =>
                            handleEdit(p.id, "price", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={p.stockQuantity}
                          onChange={(e) =>
                            handleEdit(p.id, "stockQuantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="admin-btn danger"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <AdminModal
              open={modal.open && modal.type === "product"}
              title="Добавить товар"
              onClose={() => {
                closeModal();
                setFile(null);
                setImagePreview("");
              }}
            >
              {/* Форма добавления товара */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <input id="add-product-name" placeholder="Название" />
                <select id="add-product-category">
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  id="add-product-price"
                  placeholder="Цена"
                  type="number"
                />
                <input
                  id="add-product-stock"
                  placeholder="В наличии"
                  type="number"
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setImagePreview(
                        e.target.files[0]
                          ? URL.createObjectURL(e.target.files[0])
                          : ""
                      );
                    }}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{
                        maxWidth: 80,
                        maxHeight: 80,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
                    />
                  )}
                </div>
                <input id="add-product-description" placeholder="Описание" />
                <div className="admin-modal-actions">
                  <button
                    className="admin-btn"
                    onClick={() => {
                      closeModal();
                      setFile(null);
                      setImagePreview("");
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    className="admin-btn"
                    style={{ minWidth: 120 }}
                    onClick={async () => {
                      const name =
                        document.querySelector("#add-product-name").value;
                      const price = Number(
                        document.querySelector("#add-product-price").value
                      );
                      const stockQuantity = Number(
                        document.querySelector("#add-product-stock").value
                      );
                      const categoryId = Number(
                        document.querySelector("#add-product-category").value
                      );
                      const description = document.querySelector(
                        "#add-product-description"
                      ).value;
                      await handleAddProduct({
                        name,
                        description,
                        price,
                        stockQuantity,
                        category: { id: categoryId },
                      });
                    }}
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </AdminModal>
          </div>
        ) : activeTable === "categories" ? (
          <div>
            <h2>Категории</h2>
            <div
              style={{
                margin: "16px 0",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <input
                placeholder="Фильтр по названию..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  minWidth: 220,
                }}
              />
              <button
                className="admin-btn"
                style={{ minWidth: 140 }}
                onClick={() => openAddModal("category")}
              >
                Добавить категорию
              </button>
              <button
                className="admin-btn"
                style={{ minWidth: 170 }}
                onClick={handleSave}
              >
                Сохранить изменения
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories
                  .filter((c) =>
                    c.name.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>
                        <input
                          value={c.name}
                          onChange={(e) =>
                            handleEdit(c.id, "name", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="admin-btn danger"
                          onClick={() => handleDeleteCategory(c.name)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <AdminModal
              open={modal.open && modal.type === "category"}
              title="Добавить категорию"
              onClose={closeModal}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <input id="add-category-name" placeholder="Название" />
                <div className="admin-modal-actions">
                  <button className="admin-btn" onClick={closeModal}>
                    Отмена
                  </button>
                  <button
                    className="admin-btn"
                    style={{ minWidth: 120 }}
                    onClick={() => {
                      const name =
                        document.querySelector("#add-category-name").value;
                      handleAddCategory({ name });
                    }}
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </AdminModal>
          </div>
        ) : activeTable === "users" ? (
          <div>
            <h2>Пользователи</h2>
            <div
              style={{
                margin: "16px 0",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <input
                placeholder="Фильтр по email..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  minWidth: 220,
                }}
              />
              <button
                className="admin-btn"
                style={{ minWidth: 140 }}
                onClick={() => openAddModal("user")}
              >
                Добавить пользователя
              </button>
              <button
                className="admin-btn"
                style={{ minWidth: 170 }}
                onClick={handleSave}
              >
                Сохранить изменения
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Последнее изменение имени</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) =>
                    u.email.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <input
                          value={u.email}
                          onChange={(e) =>
                            handleEdit(u.id, "email", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={u.username}
                          onChange={(e) =>
                            handleEdit(u.id, "username", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={u.role ? "admin" : "user"}
                          onChange={(e) =>
                            handleEdit(u.id, "role", e.target.value === "admin")
                          }
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        {u.lastUsernameChange
                          ? new Date(u.lastUsernameChange).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="admin-btn danger"
                          onClick={() => handleDelete(u.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <AdminModal
              open={modal.open && modal.type === "user"}
              title="Добавить пользователя"
              onClose={closeModal}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <input placeholder="Email" />
                <input placeholder="Имя" />
                <select>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <div className="admin-modal-actions">
                  <button className="admin-btn" onClick={closeModal}>
                    Отмена
                  </button>
                  <button className="admin-btn" style={{ minWidth: 120 }}>
                    Добавить
                  </button>
                </div>
              </div>
            </AdminModal>
          </div>
        ) : activeTable === "orders" ? (
          <div>
            <h2>Заказы</h2>
            <div
              className="order-cards"
              style={{ justifyContent: "flex-start" }}
            >
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-id">Заказ №{order.id}</div>
                  <div className="order-date">
                    Дата: {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className="order-status">
                    Статус:{" "}
                    <select
                      value={orderStatusDraft[order.id] ?? order.status}
                      onChange={(e) =>
                        handleOrderStatusChange(order.id, e.target.value)
                      }
                    >
                      <option value="created">created</option>
                      <option value="paid">paid</option>
                      <option value="shipped">shipped</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    <button
                      className="admin-btn"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleOrderStatusSave(order.id)}
                    >
                      Сохранить
                    </button>
                  </div>
                  <div className="order-sum">Сумма: {order.totalPrice} ₽</div>
                  <div className="order-products">
                    <div className="order-products-title">Товары:</div>
                    <ul className="order-products-list">
                      {order.orderedProductDTO?.map((item) => (
                        <li key={item.id}>
                          <span className="order-product-name">
                            {item.product?.name || "Товар"}
                          </span>
                          <span className="order-product-qty">
                            × {item.quantity}
                          </span>
                          <span className="order-product-price">
                            {item.priceAtPurchase} ₽
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <button
                      className="order-receipt-btn"
                      onClick={() =>
                        window.open(`/api/orders/${order.id}/receipt`)
                      }
                    >
                      Скачать чек
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default AdminPage;
