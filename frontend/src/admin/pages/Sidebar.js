// Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ setPage }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all localStorage items
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        // Redirect to login page
        navigate('/login');
    };

    const sidebarButton = { backgroundColor:"#34495E", border:"none", padding:10, borderRadius:5, color:"#fff", cursor:"pointer", textAlign:"left", fontSize:16 };

    return (
        <aside
            style={{
                width: "250px",
                backgroundColor: "#2C3E50",
                color: "#fff",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // penting
                height: "auto",
            }}
        >
            {/* Menu Utama */}
            <div>
                <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Admin Panel</h2>
                <nav style={{ display: "flex", flexDirection: "column", gap: "10px"}}>
                    <button style={sidebarButton} onClick={() => setPage("dashboard")}>Dashboard</button>
                    <button style={sidebarButton} onClick={() => setPage("products")}>Produk</button>
                    <button style={sidebarButton} onClick={() => setPage("categories")}>Kategori</button>
                    <button style={sidebarButton} onClick={() => setPage("customers")}>Pelanggan</button>
                    <button style={sidebarButton} onClick={() => setPage("orders")}>Pesanan</button>
                    <button style={sidebarButton} onClick={() => setPage("settings")}>Pengaturan</button>
                </nav>
            </div>

            {/* Tombol Log Out di bawah */}
            <div>
                <button style={sidebarButton} onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
