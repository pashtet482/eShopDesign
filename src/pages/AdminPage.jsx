import { useEffect, useState } from 'react';
import "../css/base.css";
import "../css/layout.css";

function AdminPage() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    fetch('/admin/tables') // Подстрой под свой backend
      .then(res => res.json())
      .then(setTables)
      .catch(console.error);
  }, []);

  return (
    <div className="container">
      <h2>Админка</h2>
      {tables.map((table, i) => (
        <div key={i}>
          <h3>{table.name}</h3>
          <pre>{JSON.stringify(table.rows, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

export default AdminPage;