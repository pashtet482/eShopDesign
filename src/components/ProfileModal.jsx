import React, { useEffect, useState } from "react";
import "../css/modals.css";
import "../css/form&input.css";

export default function ProfileModal({ isOpen, onClose, username: currentUsername, onNameChange }) {
  const username = localStorage.getItem("username");

  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [daysToChange, setDaysToChange] = useState(0);
  const [newUsername, setNewUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/users/profile-${username}`);
        const data = await response.json();

        setEmail(data.email);
        setCreatedAt(new Date(data["Creation date"]));
        setDaysToChange(data["Days to change username"]);
      } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
      }
    };

    fetchProfile();
  }, [isOpen, username]);

  const handleChangeUsername = async () => {
    try {
      const response = await fetch("/users/update-username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldUsername: username, newUsername }),
      });

      if (response.ok) {
        alert("Имя успешно изменено");
        localStorage.setItem("username", newUsername);
        if (onNameChange) onNameChange(newUsername);
        onClose();
      } else {
        const data = await response.json();
        alert(data.message || "Ошибка при смене имени");
      }
    } catch (err) {
      alert("Ошибка сервера", err);
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await fetch("/users/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, oldPassword, newPassword }),
      });

      if (response.ok) {
        alert("Пароль успешно изменён");
        onClose();
      } else {
        const data = await response.json();
        alert(data.message || "Ошибка при смене пароля");
      }
    } catch (err) {
      alert("Ошибка сервера", err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить аккаунт?")) return;

    try {
      const response = await fetch("/users/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: deletePassword }),
      });

      if (response.ok) {
        alert("Аккаунт удалён");
        localStorage.clear();
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || "Ошибка при удалении");
      }
    } catch (err) {
      alert("Ошибка сервера", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Профиль</h2>

        <p>
          <strong>Имя:</strong> {username}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <p>
          <strong>Создан:</strong>{" "}
          {createdAt ? createdAt.toLocaleDateString() : "Загрузка..."}
        </p>

        <hr className="my-4" />

        <div className="mb-4">
          <h3
            className="font-semibold cursor-pointer"
            onClick={() => setShowChangeUsername(!showChangeUsername)}
          >
            🔄 Сменить имя {showChangeUsername ? "▲" : "▼"}
          </h3>
          {showChangeUsername && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Новое имя"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="modal-input"
              />
              <div className="flex-buttons">
                <button
                  className="btn-outline"
                  onClick={handleChangeUsername}
                  disabled={daysToChange > 0}
                >
                  Сменить имя
                </button>
              </div>
              {daysToChange > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Вы сможете сменить имя через {daysToChange} дней
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3
            className="font-semibold cursor-pointer"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            🔐 Сменить пароль {showChangePassword ? "▲" : "▼"}
          </h3>
          {showChangePassword && (
            <div className="mt-2">
              <input
                type="password"
                placeholder="Старый пароль"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="modal-input"
              />
              <input
                type="password"
                placeholder="Новый пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="modal-input mt-2"
              />
              <div className="flex-buttons">
                <button className="btn-outline" onClick={handleChangePassword}>
                  Сменить пароль
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3
            className="font-semibold cursor-pointer"
            onClick={() => setShowDeleteAccount(!showDeleteAccount)}
          >
            🗑️ Удаление аккаунта {showDeleteAccount ? "▲" : "▼"}
          </h3>
          {showDeleteAccount && (
            <div className="mt-2">
              <input
                type="password"
                placeholder="Подтвердите пароль"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="modal-input"
              />
              <div className="flex-buttons">
                <button className="btn-outline" onClick={handleDeleteAccount}>
                  Удалить аккаунт
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
