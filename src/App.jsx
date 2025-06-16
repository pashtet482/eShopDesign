// src/App.jsx
import { useState } from 'react';
import './App.css';

const products = [
  {
    title: 'Монитор LG UltraGear',
    price: '15 999 руб.',
    img: '/86163be86af1a46e00316d7aebf9de11644fbb25465b62eff7c55033589c1284.png',
  },
  {
    title: 'Видеокарта Palit 4070',
    price: '54 999 руб.',
    img: '/c061e8298d7f2dc97ae5746d0c0507cfc188e2a506d0779aabc9fd25f027d8a9.png',
  },
  {
    title: 'WiFi роутер TP Link',
    price: '5 999 руб.',
    img: '/123.png',
  },
  {
    title: 'Клавиатура Дарк Проджект',
    price: '7 499 руб.',
    img: '/321.png',
  },
];

function App() {
  const [isDark, setIsDark] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleAuthModal = () => setShowAuth(!showAuth);

  return (
    <div className={isDark ? 'dark-mode' : ''}>
      <header>
        <a href="#" className="logo-link">
          <img src="/iconm.d7591962.png" alt="DocByte Logo" />
        </a>
        <nav>
          <a href="#">Главная</a>
          <a href="#">Товары</a>
          <a href="#">Акции</a>
          <a href="#">Контакты</a>
        </nav>
        <div className="action-buttons">
          <button className="btn" onClick={toggleAuthModal}>
            Вход / Регистрация
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            Сменить тему
          </button>
        </div>
      </header>

      <div className="container">
        <div className="cards">
          {products.map((product, index) => (
            <div className="card" key={index}>
              <img src={product.img} alt={product.title} />
              <h3>{product.title}</h3>
              <p>{product.price}</p>
              <button className="btn">Купить</button>
            </div>
          ))}
        </div>
      </div>

      {showAuth && (
        <div className="auth-modal">
          <h2>Вход в систему</h2>
          <form>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Введите почту" required />

            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" placeholder="Введите пароль" required />

            <div className="auth-actions">
              <button type="submit" className="btn">Войти</button>
              <button type="button" className="btn-outline" onClick={toggleAuthModal}>Закрыть</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
