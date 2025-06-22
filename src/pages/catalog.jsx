import { useEffect, useState } from "react";
import ProductModal from "../components/ProductModal";
import "../css/btn.css";

export default function Catalog({ search }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch("/products/products")
      .then((res) => res.json())
      .then(setProducts);

    fetch("/categories/get-all-categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !selectedCategory || p.category?.id === selectedCategory);

  return (
    <div style={{ display: "flex", alignItems: "stretch", minHeight: '80vh' }}>
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
          minHeight: '100%'
        }}
      />
      <div style={{ flex: 1 }}>
        <section className="product-list">
          <div
            className="cards"
            style={{ display: "flex", flexWrap: "wrap", gap: 20 }}
          >
            {filtered.map((p, index) => (
              <div
                key={index}
                className="card hover-popup"
                onClick={() => setSelectedProduct(p)}
              >
                <img
                  src={
                    p.imageUrl === "string" ? "/placeholder.png" : p.imageUrl
                  }
                  alt={p.name}
                />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p>{p.price} ₽</p>
                <p
                  className="stock"
                  style={
                    p.stockQuantity === 0
                      ? { fontStyle: "italic", color: "gray", fontWeight: "normal" }
                      : p.stockQuantity <= 5
                      ? { color: "red", fontWeight: "bold" }
                      : { color: "inherit", fontWeight: "normal" }
                  }
                >
                  {p.stockQuantity > 0
                    ? `В наличии: ${p.stockQuantity}`
                    : "Нет в наличии"}
                </p>
                <p>{p.category.name}</p>
                <button
                  className="btn"
                  disabled={p.stockQuantity === 0}
                  style={
                    p.stockQuantity === 0
                      ? { background: "#ccc", color: "#888", cursor: "not-allowed" }
                      : {}
                  }
                >
                  🛒 В корзину
                </button>
              </div>
            ))}
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
