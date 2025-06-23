import { useState } from "react";
import "../css/modals.css";
import "../css/form&input.css";

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetFields = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // всегда сначала!

    if (mode === "create-user" && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let url = "";
      let body = {};

      if (mode === "login") {
        url = "/users/login";
        body = { email, password };
      } else {
        url = "/users/create-user";
        body = { username, email, password };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(
          data?.message ||
            (mode === "login" ? "Ошибка входа" : "Ошибка регистрации")
        );
      } else {
        localStorage.setItem("username", data.username);
        localStorage.setItem("isAdmin", (data.isAdmin || false).toString());

        onLogin();
        onClose();
        resetFields();
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>
        <div className="mode-switch-buttons" style={{ marginBottom: 16 }}>
          <button
            className={`btn btn-outline ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              resetFields();
            }}
            disabled={loading}
            style={{ marginRight: "8px" }}
          >
            Вход
          </button>
          <button
            className={`btn btn-outline ${
              mode === "create-user" ? "active" : ""
            }`}
            onClick={() => {
              setMode("create-user");
              resetFields();
            }}
            disabled={loading}
          >
            Регистрация
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          {mode === "create-user" && (
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="modal-input"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="modal-input"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="modal-input"
          />

          {mode === "create-user" && (
            <input
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="modal-input"
            />
          )}

          <button type="submit" disabled={loading} className="btn">
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
