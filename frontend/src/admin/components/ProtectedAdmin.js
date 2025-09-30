import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedAdmin = ({ children }) => {
    const role = localStorage.getItem("userRole"); // ambil role dari login
    if (role !== "admin") {
        return <Navigate to="/login" />; // redirect kalau bukan admin
    }
    return children;
};

export default ProtectedAdmin;
