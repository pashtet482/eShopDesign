import { useEffect, useState } from "react";
import ProductModal from "../components/ProductModal";
import { addToCart, getCart } from "../utils/cart";
import "../css/btn.css";

function getImageUrl(base, path, placeholder) {
  if (!path)
    return placeholder ? getImageUrl(base, placeholder) : "/placeholder.png";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

export default function Catalog({ search }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(getCart());
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch("/products/products")
      .then((res) => res.json())
      .then(setProducts);

    fetch("/categories/get-all-categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const updateCart = () => {
      setCart([...getCart()]); // Создаем новый массив для триггера обновления
    };
    window.addEventListener("cart-updated", updateCart);
    return () => window.removeEventListener("cart-updated", updateCart);
  }, []);

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !selectedCategory || p.category?.id === selectedCategory);

  const handleAdd = (product) => {
    addToCart(product);
    // Не нужно setTimeout, так как addToCart уже вызывает событие cart-updated
  };

  return (
    <div style={{ display: "flex", alignItems: "stretch", minHeight: "80vh" }}>
      <aside className="sidebar">
        <h3>Категории</h3>
        <ul>
          {selectedCategory != null && (
            <li
              onClick={() => setSelectedCategory(null)}
              style={{ color: "red", fontWeight: "bold", cursor: "pointer" }}
            >
              Сбросить фильтр
            </li>
          )}
          {categories.map((cat) => (
            <li
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                fontWeight: selectedCategory === cat.id ? "bold" : "normal",
                cursor: "pointer",
              }}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </aside>
      <div
        style={{
          width: 2,
          background: "#eee",
          margin: "0 24px",
          alignSelf: "stretch",
          minHeight: "100%",
        }}
      />
      <div style={{ flex: 1 }}>
        <section className="product-list">
          <div
            className="cards"
            style={{ display: "flex", flexWrap: "wrap", gap: 20 }}
          >
            {filtered.map((p) => {
              const cartItem = cart.find((item) => item.id === p.id);
              const cartQty = cartItem ? cartItem.quantity : 0;
              const availableQty = Math.max(0, p.stockQuantity - cartQty); // Добавляем Math.max для защиты от отрицательных значений

              return (
                <div
                  key={p.id}
                  className="card hover-popup"
                  onClick={() => setSelectedProduct(p)}
                >
                  <img
                    src={getImageUrl(
                      API_BASE_URL,
                      p.imageUrl,
                      p.placeholderImageUrl
                    )}
                    alt={p.name}
                  />
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <p>{p.price} ₽</p>
                  <p
                    className="stock"
                    style={
                      availableQty === 0
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
                    {availableQty > 0
                      ? `В наличии: ${availableQty}`
                      : "Нет в наличии"}
                  </p>
                  <p>{p.category.name}</p>
                  <button
                    className="btn"
                    disabled={availableQty === 0}
                    style={
                      availableQty === 0
                        ? {
                            background: "#ccc",
                            color: "#888",
                            cursor: "not-allowed",
                          }
                        : {}
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(p);
                    }}
                  >
                    🛒 В корзину
                  </button>
                </div>
              );
            })}
          </div>

          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </section>
      </div>
    </div>
  );
}