import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../admin/pages/css/CustomAuth.css";
import { AuthContext } from "../../AuthContext";

const CLIENT_ID =
  "676687989871-fl87bs6jn6n2hha4c5arrdig6de61h7p.apps.googleusercontent.com";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
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
      if (window.google && document.getElementById("googleRegisterDiv")) {
        try {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleCredentialResponse,
          });
          window.google.accounts.id.renderButton(
            document.getElementById("googleRegisterDiv"),
            {
              theme: "outline",
              size: "large",
              width: "280",
              shape: "circle",
              text: "signup_with",
            }
          );
        } catch (e) {
          console.warn("Google Identity init error", e);
        }
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    const idToken = response?.credential;
    if (!idToken) return setError("Google sign-in failed");

    try {
      const res = await axios.post(
        "http://31.97.109.187:5000/api/auth/google-login",
        { idToken }
      );
      const data = res.data;
      const token = data.token || "";
      // store token and user info
      if (token) localStorage.setItem("token", token);
      if (data.user?.id) localStorage.setItem("userId", data.user.id);
      if (data.user?.name) localStorage.setItem("userName", data.user.name);
      login(data.role || "customer", data.user?.id, token, data.user?.name);

      // navigate to home
      navigate("/customer/home");
    } catch (err) {
      console.error("Google register error", err);
      setError(err.response?.data?.message || "Register with Google failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post("http://31.97.109.187:5000/api/customers/register", {
        name,
        email,
        password,
      });
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Daftar Akun Baru</h1>
          <p className="auth-subtitle">Buat akun untuk mulai berbelanja</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
              disabled={isLoading}
            />
          </div>

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
            {isLoading ? "Loading..." : "Daftar"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div id="googleRegisterDiv" style={{ display: "inline-block" }} />
        </div>

        <div className="auth-link">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "12px",
            color: "#a0aec0",
          }}
        >
          Dengan mendaftar, Anda menyetujui syarat dan ketentuan
        </div>
      </div>
    </div>
  );
};

export default Register;
