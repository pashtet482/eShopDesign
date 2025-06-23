import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Catalog from "./pages/catalog";
import CartPage from "./pages/cart";
import AdminPage from "./pages/AdminPage";
import { useState } from "react";
import "./css/base.css";
import "./css/btn.css";
import "./css/cards.css";
import "./css/dark.css";
import "./css/form&input.css";
import "./css/layout.css";
import "./css/logo.css";
import "./css/modals.css";
import "./css/utilities.css";
import "./css/var.css";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [search, setSearch] = useState("");

  return (
    <Router>
      <Layout
        isDark={isDark}
        setIsDark={setIsDark}
        search={search}
        setSearch={setSearch}
      >
        <Routes>
          <Route path="/" element={<Catalog search={search} />} />
          <Route path="/cart" element={<CartPage isDark={isDark} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
