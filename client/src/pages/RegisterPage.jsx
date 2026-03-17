import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, tokenStore } from "../api/http";
import "./RegisterPage.css";

export default function RegisterPage() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const register = async () => {
    setMsg("");
    try {
      const res = await api.post("/auth/register", { username, email, password });
      tokenStore.set(res.data.accessToken);
      setMsg("Qeydiyyat uğurlu ✅");
      nav("/");
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__overlay"></div>

      <div className="register-page__container">
        <div className="register-page__card">
          <div className="register-page__form">
            <h2 className="register-page__title">Register</h2>
            <p className="register-page__subtitle">
              Yeni hesab yaradın və platformadan rahat istifadə edin
            </p>

            <div className="register-page__field">
              <label className="register-page__label">Username</label>
              <input
                className="register-page__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>

            <div className="register-page__field">
              <label className="register-page__label">Email</label>
              <input
                className="register-page__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>

            <div className="register-page__field">
              <label className="register-page__label">Şifrə</label>
              <input
                className="register-page__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrə"
                type="password"
              />
            </div>

            <button
              className="register-page__button"
              onClick={register}
              type="button"
            >
              Qeydiyyatdan keç
            </button>

            <div className="register-page__footer">
              Hesabın var?{" "}
              <Link to="/login" className="register-page__link">
                Login
              </Link>
            </div>

            {msg && <div className="register-page__message">{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}