// src/App.jsx
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showAuth, setShowAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || null);

  // Load data
  useEffect(() => {
    fetch('/products/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);

    fetch('/categories/get-all-categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Save theme and cart
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleAuthModal = () => setShowAuth(prev => !prev);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      alert('Ошибка авторизации: неверный email или пароль');
      return;
    }

    const data = await res.json();

    if (data.email) {
      localStorage.setItem('userEmail', data.email);
      setUserEmail(data.email);
      setShowAuth(false);
    } else {
      alert('Ошибка: email не получен с сервера');
    }
  } catch (err) {
    console.error('Ошибка при запросе авторизации:', err);
    alert('Ошибка подключения к серверу');
  }
};

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('userEmail');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p.productId === product.id);
      if (exists) {
        return prev.map(p =>
          p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(p => p.productId !== productId));
  };

  const placeOrder = () => {
    if (!userId) return alert('Сначала войдите в аккаунт.');

    fetch('/orders/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(userId),
        orderItems: cart
      })
    })
      .then(res => res.json())
      .then(() => {
        alert('Заказ оформлен!');
        setCart([]);
      })
      .catch(console.error);
  };

  const filteredProducts = products
    .filter(p => p.name && p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !selectedCategory || p.category_id === selectedCategory);

  return (
    <div className={`site-wrapper ${isDark ? 'dark-mode' : ''}`}>
      <header>
        <a href="#" className="logo-link">
          <img src="/iconm.d7591962.png" alt="DocByte Logo" />
        </a>
        <nav>
          <a href="#">Главная</a>
          <a href="#">Товары</a>
        </nav>
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn">Найти</button>
        </div>
        <div className="action-buttons">
          {userEmail ? (
            <>
              <span>{userEmail}</span>
              <button className="btn-outline" onClick={logout}>Выйти</button>
            </>
          ) : (
            <button className="btn" onClick={toggleAuthModal}>Вход</button>
          )}
          <button className="btn" onClick={placeOrder}>Корзина ({cart.reduce((s, i) => s + i.quantity, 0)})</button>
          <button className="theme-toggle" onClick={toggleTheme}>Тема</button>
        </div>
      </header>

      <main className="main-layout">
        <aside className="sidebar">
          <h3>Категории</h3>
          <ul>
            {categories.map((cat) => (
              <li
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{ cursor: 'pointer', fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' }}>
                {cat.name}
              </li>
            ))}
            {selectedCategory && <li onClick={() => setSelectedCategory(null)} style={{ cursor: 'pointer', color: 'red' }}>Сбросить фильтр</li>}
          </ul>
        </aside>

        <section className="product-list">
          <div className="cards">
            {filteredProducts.map((product) => (
              <div className="card" key={product.id}>
                <img src={product.image_url} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.price} ₽</p>
                <button className="btn" onClick={() => addToCart(product)}>Купить</button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showAuth && (
        <div className="modal-backdrop">
          <div className="auth-modal">
            <h2>Вход</h2>
            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />

              <div className="auth-actions">
                <button type="submit" className="btn">Войти</button>
                <button type="button" className="btn-outline" onClick={toggleAuthModal}>Закрыть</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;