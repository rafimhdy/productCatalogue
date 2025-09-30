import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { role: "admin" | "customer", id: number, token: string }
    const [loading, setLoading] = useState(true);

    // Saat pertama kali load, cek localStorage
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const id = localStorage.getItem("userId");
        const name = localStorage.getItem("userName");
        const token = localStorage.getItem("token");

        console.log("AuthContext initialized with:", { role, id, name, token });
        console.log("AuthContext loaded userName from localStorage:", name);
        if (role && id) {
            setUser({ role, id, name, token });
        }
        console.log("AuthContext initialized with user:", { role, id, name, token });
        setLoading(false);
    }, []);

    // new: login accepts token optional
    const login = (role, id, token, name) => {
        if (token) localStorage.setItem('token', token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", id);
        localStorage.setItem("userName", name);
        setUser({ role, id, name, token });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        setUser(null); // kalau pakai context
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};