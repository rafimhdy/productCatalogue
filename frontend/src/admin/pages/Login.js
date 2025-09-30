import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import "./css/CustomAuth.css";
import axios from "axios";

const CLIENT_ID =
  "676687989871-fl87bs6jn6n2hha4c5arrdig6de61h7p.apps.googleusercontent.com";

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    // Load Google Identity Services script once
    const id = "google-identity-script";
    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = id;
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      document.body.appendChild(script);
    } else {
      initGoogle();
    }

    function initGoogle() {
      if (window.google && document.getElementById("googleSignInDiv")) {
        try {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleCredentialResponse,
          });
          window.google.accounts.id.renderButton(
            document.getElementById("googleSignInDiv"),
            {
              theme: "outline",
              size: "large",
              width: "280",
              shape: "circle",
              text: "continue_with",
            }
          );
        } catch (e) {
          console.warn("Google Identity init error", e);
        }
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    // response.credential is the ID token
    const idToken = response?.credential;
    if (!idToken) return setError("Google sign-in failed");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/google-login`, {
        idToken,
      });
      const data = res.data;
      const token = data.token || "";
      // store token and user info
      if (token) localStorage.setItem("token", token);
      if (data.user?.id) localStorage.setItem("userId", data.user.id);
      if (data.user?.name) localStorage.setItem("userName", data.user.name);
      login(data.role || "customer", data.user?.id, token, data.user?.name);
      // navigate based on role
      if ((data.role || "customer") === "admin") navigate("/admin/dashboard");
      else navigate("/customer/home");
    } catch (err) {
      console.error("Google login error", err);
      setError(err.response?.data?.message || "Login with Google failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Try admin login first
      const adminRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminRes.json();

      if (adminRes.ok && adminData.role === "admin") {
        const token = adminData.token || "";
        localStorage.setItem("token", token);
        localStorage.setItem("userId", adminData.user.id);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", adminData.user.name);
        login("admin", adminData.user.id, token, adminData.user.name);
        navigate("/admin/dashboard");
        return;
      }

      // If not admin, try customer login
      const customerRes = await fetch(`${API_BASE}/api/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const customerData = await customerRes.json();

      if (customerRes.ok) {
        const token = customerData.token || "";
        localStorage.setItem("token", token);
        localStorage.setItem("userId", customerData.user.id);
        localStorage.setItem("userRole", "customer");
        localStorage.setItem("userName", customerData.user.name);
        login("customer", customerData.user.id, token, customerData.user.name);
        navigate("/customer/home");
        return;
      }

      // If both failed, show error
      setError("Email atau password salah");
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
          <h1 className="auth-title">Selamat Datang</h1>
          <p className="auth-subtitle">Masuk ke akun Anda untuk melanjutkan</p>
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

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div id="googleSignInDiv" style={{ display: "inline-block" }} />
        </div>

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

export default Login;
