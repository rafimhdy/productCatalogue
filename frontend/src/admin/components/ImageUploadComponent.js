import React, { useState } from "react";

const ImageUploadComponent = ({ onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(
        "http://31.97.109.187:5000/api/products/upload-image",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Call parent callback with the uploaded image URL
      if (onImageUploaded) {
        onImageUploaded(data.imageUrl);
      }

      alert("Image uploaded successfully!");

      // Reset form
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div
      style={{
        border: "2px dashed #ccc",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#fafafa",
      }}
    >
      <h4>Upload Product Image</h4>

      {!preview ? (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ marginBottom: "10px" }}
          />
          <p style={{ color: "#666", fontSize: "14px" }}>
            Select an image file (JPG, PNG, GIF) - Max 5MB
          </p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "15px" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>

            <button
              onClick={clearSelection}
              disabled={uploading}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
