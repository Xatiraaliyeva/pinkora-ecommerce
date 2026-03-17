import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, tokenStore } from "../api/http";
import { useAppState } from "../context/AppState";
import "./LoginPage.css";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { loadMe } = useAppState();

  const submit = async () => {
    setMsg("");
    try {
      const r = await api.post("/auth/login", { emailOrUsername, password });

      if (r?.data?.accessToken) tokenStore.set(r.data.accessToken);

      const me = await loadMe();

      const next = sp.get("next");
      if (next) {
        navigate(next, { replace: true });
        return;
      }

      if (me?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__overlay"></div>

      <div className="login-page__container">
        <div className="login-page__card">
          <div className="login-page__form">
            <h2 className="login-page__title">Login</h2>
            <p className="login-page__subtitle">
              Hesabınıza daxil olun
            </p>

            <div className="login-page__field">
              <label className="login-page__label">Email və ya Username</label>
              <input
                className="login-page__input"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Email or Username"
              />
            </div>

            <div className="login-page__field">
              <label className="login-page__label">Şifrə</label>
              <input
                className="login-page__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
              />
            </div>

            <button className="login-page__button" onClick={submit} type="button">
              Login
            </button>

            {msg ? <div className="login-page__message">{msg}</div> : null}

            <div className="login-page__footer">
              Hesabın yoxdur?{" "}
              <Link to="/register" className="login-page__link">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}