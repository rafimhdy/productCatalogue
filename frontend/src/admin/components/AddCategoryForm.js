import React, { useState } from "react";
import axios from "axios";

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/categories", {
        name,
        description,
      });
      setName("");
      setDescription("");
      onCategoryAdded();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <input
        style={{
          padding: "8px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
        type="text"
        placeholder="Nama kategori"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        style={{
          padding: "8px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
        type="text"
        placeholder="Deskripsi"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        type="submit"
      >
        Tambah Kategori
      </button>
    </form>
  );
};

export default AddCategoryForm;
