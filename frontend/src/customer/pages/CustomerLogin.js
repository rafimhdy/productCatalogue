import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import "../../admin/pages/css/CustomAuth.css";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://31.97.109.187:5000/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login gagal");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", "customer");
      console.log("Saving userName to localStorage:", data.user.name);
      console.log("Login response data:", data);
      localStorage.setItem("userName", data.user.name);

      // call login(role, id, token, name)
      login("customer", data.user.id, data.token, data.user.name);
      navigate("/customer/home");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Selamat Datang Kembali</h1>
          <p className="auth-subtitle">Masuk untuk mulai berbelanja</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Loading..." : "Masuk"}
          </button>
        </form>

        <div className="auth-link">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "12px",
            color: "#a0aec0",
          }}
        >
          Sistem aman dan terpercaya
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
