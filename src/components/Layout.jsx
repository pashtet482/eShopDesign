import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal.jsx";
import ProfileModal from "./ProfileModal";
import { getCart } from "../utils/cart";
import "../css/layout.css";
import "../css/logo.css";
import "../css/base.css";

export default function Layout({
  children,
  isDark,
  setIsDark,
  search,
  setSearch,
}) {
  const navigate = useNavigate();
  const [EMAIL, setEmail] = useState(null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedName = localStorage.getItem("username");
    const storedAdmin = localStorage.getItem("isAdmin") === "true";

    if (storedEmail) setEmail(storedEmail);
    if (storedName) setUsername(storedName);
    setIsAdmin(storedAdmin);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    updateCartCount();
    window.addEventListener("focus", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);
    return () => {
      window.removeEventListener("focus", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    setUsername("");
    setIsAdmin(false);
    setEmail(null);
    navigate("/");
  };

  const handleNameChange = (newUsername) => {
    setUsername(newUsername);
  };

  return (
    <div className={`site-wrapper ${isDark ? "dark-mode" : ""}`}>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          const storedEmail = localStorage.getItem("email");
          const storedName = localStorage.getItem("username");
          const storedAdmin = localStorage.getItem("isAdmin") === "true";
          setEmail(storedEmail);
          setUsername(storedName);
            setIsAdmin(storedAdmin);
          }}
          />
          <header className="header">
          <Link to="/" className="logo-link">
            <img src="/logo.svg" alt="Logo" />
            <div className="logo-text">
            <span className="logo-main">DocByte</span>
            <small className="logo-sub">интернет‑магазин</small>
            </div>
          </Link>

          <input
            type="text"
            placeholder="Поиск товаров..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <div className="action-buttons">
            <button className="btn-outline" onClick={() => navigate("/")}>
            Каталог
            </button>
            <button className="btn-outline" onClick={() => navigate("/cart")}
            style={{ position: "relative" }}>
            Корзина
            {cartCount > 0 && (
              <span style={{
              position: "absolute",
              top: -6,
              right: -10,
              background: "#e74c3c",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 7px",
              fontSize: "12px",
              fontWeight: "bold"
              }}>{cartCount}</span>
            )}
            </button>

            <button className="btn-outline" onClick={() => navigate("/orders")}>Мои заказы</button>

            {isAdmin && (
            <button className="btn-outline" onClick={() => navigate("/admin")}>
              Админка
            </button>
            )}

            <button
            className="btn-outline"
            onClick={() =>
              setIsDark((prev) => {
                const next = !prev;
                localStorage.setItem("theme", next ? "dark" : "light");
                return next;
              })
            }
          >
            Тема
          </button>

          {!username ? (
            <button
              className="btn-outline"
              onClick={() => setShowLoginModal(true)}
            >
              Войти / Регистрация
            </button>
          ) : (
            <>
              <button
                onClick={() => setProfileOpen(true)}
                className="btn btn-text"
              >
                {username}
              </button>
              <button className="btn-outline" onClick={handleLogout}>
                Выйти
              </button>
            </>
          )}
        </div>
      </header>

      <main className="main-layout">{children}</main>
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        username={username}
        onLogout={handleLogout}
        onNameChange={handleNameChange}
      />
    </div>
  );
}
