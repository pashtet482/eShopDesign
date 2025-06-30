import { useEffect, useState } from "react";
import "../css/base.css";
import "../css/layout.css";
import "../css/orders-list.css";
import "../css/admin-panel.css";
import { formatPrice } from "../utils/formatPrice";

const TABLES = [
  { key: "products-admin", label: "Товары" },
  { key: "categories-admin", label: "Категории" },
  { key: "users-admin", label: "Пользователи" },
  { key: "orders-admin", label: "Заказы" },
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
  const [activeTable, setActiveTable] = useState("products-admin");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [adminOrderStatusDraft, setAdminOrderStatusDraft] = useState({});
  const [modal, setModal] = useState({ open: false, type: null });
  const [MODALDATA, setModalData] = useState({});
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [adminOrderDateFilter, setAdminOrderDateFilter] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFile, setEditFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [modalError, setModalError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  const uploadProductImage = async (file) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/products/product-image", {
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
    if (activeTable === "products-admin") {
      fetch("/api/products/products")
        .then((r) => r.json())
        .then(setProducts)
        .finally(() => setLoading(false));
      fetch("/api/categories/get-all-categories")
        .then((r) => r.json())
        .then(setCategories);
    } else if (activeTable === "categories-admin") {
      fetch("/api/categories/get-all-categories")
        .then((r) => r.json())
        .then(setCategories)
        .finally(() => setLoading(false));
    } else if (activeTable === "users-admin") {
      fetch("/api/users/get-all-users")
        .then((r) => r.json())
        .then(setUsers)
        .finally(() => setLoading(false));
    } else if (activeTable === "orders-admin") {
      fetch("/api/orders/get-all-orders")
        .then((r) => r.json())
        .then(setAdminOrders)
        .finally(() => setLoading(false));
    }
  }, [activeTable]);

  const handleAdminOrderStatusChange = (orderId, newStatus) => {
    setAdminOrderStatusDraft((prev) => ({ ...prev, [orderId]: newStatus }));
  };
  const statusRuToEn = {
    Оформлен: "PENDING",
    Отправлен: "SHIPPED",
    Доставлен: "DELIVERED",
    Отменён: "CANCELLED",
  };
  const handleAdminOrderStatusSave = async (orderId) => {
    setLoading(true);
    const ruStatus =
      adminOrderStatusDraft[orderId] ?? adminOrders.find((o) => o.id === orderId)?.status;
    const newStatus = statusRuToEn[ruStatus] || ruStatus;
    try {
      await fetch("/api/orders/change-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      fetch("/api/orders/get-all-orders")
        .then((r) => r.json())
        .then(setAdminOrders)
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
      alert("Ошибка при смене статуса заказа");
    }
  };

  const openAddModal = (type) => {
    setModal({ open: true, type });
    setModalData({});
  };
  const closeModal = () => setModal({ open: false, type: null });

  const handleAddProduct = async (data) => {
    setLoading(true);
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadProductImage(file);
    }
    try {
      const res = await fetch("/api/products/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, imageUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка добавления товара");
      }
      setModal({ open: false, type: null });
      setFile(null);
      setImagePreview("");
      fetch("/api/products/products")
        .then((r) => r.json())
        .then(setProducts)
        .finally(() => setLoading(false));
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const handleAddCategory = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка добавления категории");
      }
      setModal({ open: false, type: null });
      fetch("/api/categories/get-all-categories")
        .then((r) => r.json())
        .then(setCategories)
        .finally(() => setLoading(false));
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const openEditModal = (product) => {
    setEditProduct({ ...product, categoryId: product.category?.id });
    setEditImagePreview(
      product.imageUrl
        ? product.imageUrl.startsWith("http")
          ? product.imageUrl
          : `${API_BASE_URL?.replace(/\/$/, "")}/${product.imageUrl.replace(
              /^\//,
              ""
            )}`
        : ""
    );
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditProduct(null);
    setEditFile(null);
    setEditImagePreview("");
  };
  const handleEditFileChange = (e) => {
    setEditFile(e.target.files[0]);
    setEditImagePreview(
      e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : ""
    );
  };
  const handleEditProductChange = (field, value) => {
    setEditProduct((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditProductSave = async () => {
    setLoading(true);
    let imageUrl = editProduct.imageUrl;
    if (editFile) {
      imageUrl = await uploadProductImage(editFile);
    }
    const updated = {
      ...editProduct,
      imageUrl,
      price: Number(editProduct.price),
      stockQuantity: Number(editProduct.stockQuantity),
      category: {
        id: Number(editProduct.categoryId),
        name:
          categories.find((c) => c.id === Number(editProduct.categoryId))
            ?.name || "",
      },
    };
    try {
      const res = await fetch(`/api/products/update-product/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка редактирования товара");
      }
      setEditModalOpen(false);
      setEditProduct(null);
      setEditFile(null);
      setEditImagePreview("");
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...updated } : p))
      );
      setLoading(false);
    } catch (e) {
      setLoading(false);
      throw e;
    }
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
        ) : activeTable === "products-admin" ? (
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
                  <th>Изображение</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) =>
                    p.name.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => openEditModal(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.category?.name || "-"}</td>
                      <td>{p.description}</td>
                      <td>{formatPrice(p.price)}</td>
                      <td>{p.stockQuantity}</td>
                      <td>
                        {p.imageUrl ? (
                          <img
                            src={
                              p.imageUrl.startsWith("http")
                                ? p.imageUrl
                                : `${API_BASE_URL?.replace(
                                    /\/$/,
                                    ""
                                  )}/${p.imageUrl.replace(/^\//, "")}`
                            }
                            alt="preview"
                            style={{
                              maxWidth: 60,
                              maxHeight: 60,
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              background: "#fff",
                            }}
                          />
                        ) : (
                          <span style={{ color: "#aaa", fontSize: 12 }}>
                            нет
                          </span>
                        )}
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
                setModalError("");
              }}
            >
              {/* Форма добавления товара */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {modalError && (
                  <div
                    style={{
                      color: "#d32f2f",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {modalError}
                  </div>
                )}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexDirection: "row",
                  }}
                >
                  <label className="admin-file-btn">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                        setImagePreview(
                          e.target.files[0]
                            ? URL.createObjectURL(e.target.files[0])
                            : ""
                        );
                      }}
                    />
                    <span>Выбрать изображение</span>
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{
                        maxWidth: 80,
                        maxHeight: 80,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        marginLeft: 0,
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
                      setModalError("");
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    className="admin-btn"
                    style={{ minWidth: 120 }}
                    onClick={async () => {
                      setModalError("");
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
                      try {
                        await handleAddProduct({
                          name,
                          description,
                          price,
                          stockQuantity,
                          category: { id: categoryId },
                        });
                      } catch (e) {
                        setModalError(e.message || "Ошибка добавления товара");
                      }
                    }}
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </AdminModal>
            {editModalOpen && (
              <div className="admin-modal-backdrop" onClick={closeEditModal}>
                <div
                  className="admin-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="admin-modal-close"
                    onClick={closeEditModal}
                  >
                    &times;
                  </button>
                  <h3>Редактировать товар</h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {modalError && (
                      <div
                        style={{
                          color: "#d32f2f",
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        {modalError}
                      </div>
                    )}
                    <label>
                      Название
                      <input
                        value={editProduct.name}
                        onChange={(e) =>
                          handleEditProductChange("name", e.target.value)
                        }
                        placeholder="Название"
                      />
                    </label>
                    <label>
                      Категория
                      <select
                        value={editProduct.categoryId}
                        onChange={(e) =>
                          handleEditProductChange("categoryId", e.target.value)
                        }
                      >
                        <option value="">Выберите категорию</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Цена
                      <input
                        value={editProduct.price}
                        type="number"
                        onChange={(e) =>
                          handleEditProductChange("price", e.target.value)
                        }
                        placeholder="Цена"
                      />
                    </label>
                    <label>
                      В наличии
                      <input
                        value={editProduct.stockQuantity}
                        type="number"
                        onChange={(e) =>
                          handleEditProductChange(
                            "stockQuantity",
                            e.target.value
                          )
                        }
                        placeholder="В наличии"
                      />
                    </label>
                    <label>
                      Описание
                      <input
                        value={editProduct.description}
                        onChange={(e) =>
                          handleEditProductChange("description", e.target.value)
                        }
                        placeholder="Описание"
                      />
                    </label>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      Изображение
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexDirection: "row",
                        }}
                      >
                        <label className="admin-file-btn">
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleEditFileChange}
                          />
                          <span>Выбрать изображение</span>
                        </label>
                        {editImagePreview && (
                          <img
                            src={editImagePreview}
                            alt="preview"
                            style={{
                              maxWidth: 80,
                              maxHeight: 80,
                              borderRadius: 8,
                              border: "1px solid #ccc",
                              marginLeft: 0,
                            }}
                          />
                        )}
                      </label>
                    </label>
                    <div className="admin-modal-actions">
                      <button
                        className="admin-btn"
                        onClick={() => {
                          closeEditModal();
                          setModalError("");
                        }}
                      >
                        Отмена
                      </button>
                      <button
                        className="admin-btn"
                        style={{ minWidth: 120 }}
                        onClick={async () => {
                          setModalError("");
                          try {
                            await handleEditProductSave();
                          } catch (e) {
                            setModalError(
                              e.message || "Ошибка редактирования товара"
                            );
                          }
                        }}
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTable === "categories-admin" ? (
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
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                </tr>
              </thead>
              <tbody>
                {categories
                  .filter((c) =>
                    c.name.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((c) => (
                    <tr
                      key={c.id}
                      onClick={() =>
                        setModal({ open: true, type: "edit-category", data: c })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <AdminModal
              open={modal.open && modal.type === "category"}
              title="Добавить категорию"
              onClose={() => {
                closeModal();
                setModalError("");
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {modalError && (
                  <div
                    style={{
                      color: "#d32f2f",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {modalError}
                  </div>
                )}
                <input id="add-category-name" placeholder="Название" />
                <div className="admin-modal-actions">
                  <button
                    className="admin-btn"
                    onClick={() => {
                      closeModal();
                      setModalError("");
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    className="admin-btn"
                    style={{ minWidth: 120 }}
                    onClick={async () => {
                      setModalError("");
                      const name =
                        document.querySelector("#add-category-name").value;
                      try {
                        await handleAddCategory({ name });
                      } catch (e) {
                        setModalError(
                          e.message || "Ошибка добавления категории"
                        );
                      }
                    }}
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </AdminModal>
            <AdminModal
              open={modal.open && modal.type === "edit-category"}
              title="Редактировать категорию"
              onClose={() => {
                closeModal();
                setModalError("");
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {modalError && (
                  <div
                    style={{
                      color: "#d32f2f",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {modalError}
                  </div>
                )}
                <label>
                  Название
                  <input
                    value={modal.data?.name || ""}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, name: e.target.value },
                      }))
                    }
                    placeholder="Название"
                  />
                </label>
                <div className="admin-modal-actions">
                  <button
                    className="admin-btn"
                    onClick={() => {
                      closeModal();
                      setModalError("");
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    className="admin-btn"
                    style={{ minWidth: 120 }}
                    onClick={async () => {
                      setModalError("");
                      setLoading(true);
                      const oldName =
                        categories.find((c) => c.id === modal.data.id)?.name ||
                        "";
                      try {
                        const res = await fetch(
                          `/api/categories/change-category-name`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              oldName,
                              newName: modal.data.name,
                            }),
                          }
                        );
                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(
                            err.message || "Ошибка смены категории"
                          );
                        }
                        closeModal();
                        fetch("/api/categories/get-all-categories")
                          .then((r) => r.json())
                          .then(setCategories)
                          .finally(() => setLoading(false));
                      } catch (e) {
                        setModalError(e.message || "Ошибка смены категории");
                        setLoading(false);
                      }
                    }}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </AdminModal>
          </div>
        ) : activeTable === "users-admin" ? (
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
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Последнее изменение имени</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) =>
                    u.email.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((u) => (
                    <tr
                      key={u.id}
                      onClick={() =>
                        setModal({ open: true, type: "edit-user", data: u })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role ? "Админ" : "Пользователь"}</td>
                      <td>
                        {u.lastUsernameChange
                          ? new Date(u.lastUsernameChange).toLocaleString()
                          : "-"}
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
            <AdminModal
              open={modal.open && modal.type === "edit-user"}
              title="Изменить данные"
              onClose={closeModal}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <label>
                  Email
                  <div
                    style={{
                      padding: "8px 0",
                      color: "var(--text-main, #222)",
                    }}
                  >
                    {modal.data?.email || ""}
                  </div>
                </label>
                <label>
                  Имя
                  <div
                    style={{
                      padding: "8px 0",
                      color: "var(--text-main, #222)",
                    }}
                  >
                    {modal.data?.username || ""}
                  </div>
                </label>
                <label>
                  Роль
                  <select
                    value={modal.data?.role ? "admin" : "user"}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, role: e.target.value === "admin" },
                      }))
                    }
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Админ</option>
                  </select>
                </label>
                <div className="admin-modal-actions">
                  <button className="admin-btn" onClick={closeModal}>
                    Отмена
                  </button>
                  <button
                    className="admin-btn"
                    style={{ minWidth: 120 }}
                    onClick={async () => {
                      setLoading(true);
                      console.log({
                        email: modal.data.email,
                        role: modal.data.role,
                      });
                      await fetch(`/api/users/change-role`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: modal.data.email,
                          role: modal.data.role,
                        }),
                      });
                      closeModal();
                      fetch("/api/users/get-all-users")
                        .then((r) => r.json())
                        .then(setUsers)
                        .finally(() => setLoading(false));
                    }}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </AdminModal>
          </div>
        ) : activeTable === "orders-admin" ? (
          <div>
            <h2>Заказы</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <label style={{ fontWeight: 500 }}>Фильтр по дате:</label>
              <input
                type="date"
                value={adminOrderDateFilter}
                onChange={(e) => setAdminOrderDateFilter(e.target.value)}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  minWidth: 140,
                }}
              />
              <button
                className="admin-btn"
                style={{ minWidth: 80, padding: "6px 12px" }}
                onClick={() => setAdminOrderDateFilter("")}
                disabled={!adminOrderDateFilter}
              >
                Сбросить
              </button>
            </div>
            <div
              className="order-cards"
              style={{ justifyContent: "flex-start" }}
            >
              {[...adminOrders]
                .filter(
                  (order) =>
                    !adminOrderDateFilter ||
                    new Date(order.createdAt).toISOString().slice(0, 10) ===
                      adminOrderDateFilter
                )
                .sort((a, b) => a.id - b.id)
                .map((order) => (
                  <div className="order-card" key={order.id}>
                    <div className="order-id">Заказ №{order.id}</div>
                    <div className="order-date">
                      Дата: {new Date(order.createdAt).toLocaleString()}
                    </div>
                    <div className="order-status">
                      Статус:{" "}
                      <select
                        className="order-status-select"
                        value={adminOrderStatusDraft[order.id] ?? order.status}
                        onChange={(e) =>
                          handleAdminOrderStatusChange(order.id, e.target.value)
                        }
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #d32f2f",
                          background: "var(--background-secondary, #fff)",
                          color: "var(--text-main, #222)",
                          fontWeight: 500,
                          minWidth: 120,
                          outline: "none",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          transition: "border .2s, box-shadow .2s",
                        }}
                      >
                        <option value="PENDING">Оформлен</option>
                        <option value="SHIPPED">Отправлен</option>
                        <option value="DELIVERED">Доставлен</option>
                        <option value="CANCELLED">Отменён</option>
                      </select>
                      <button
                        className="admin-btn"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleAdminOrderStatusSave(order.id)}
                      >
                        Сохранить
                      </button>
                    </div>
                    <div className="order-sum">
                      Сумма: {formatPrice(order.totalPrice)} ₽
                    </div>
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
                              {formatPrice(item.priceAtPurchase)} ₽
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
