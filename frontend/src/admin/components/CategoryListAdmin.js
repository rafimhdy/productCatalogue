import React, { useEffect, useState } from "react";
import axios from "axios";

const CategoryListAdmin = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://31.97.109.187:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Yakin mau hapus kategori?")) {
      try {
        await axios.delete(`http://31.97.109.187:5000/api/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {categories.map((c) => (
        <div
          key={c.id}
          style={{
            padding: 10,
            background: "#fff",
            borderRadius: 5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>{c.name}</strong> <br />
            <span style={{ fontSize: 12, color: "#555" }}>{c.description}</span>
          </div>
          <button
            onClick={() => handleDelete(c.id)}
            style={{
              background: "#f66",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "5px 10px",
            }}
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
};

export default CategoryListAdmin;
