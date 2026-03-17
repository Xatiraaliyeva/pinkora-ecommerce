import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, tokenStore } from "../api/http";
import { useAppState } from "../context/AppState";
import "./ProfilePage.css";

export default function ProfilePage() {
  const nav = useNavigate();
  const { me, loadMe } = useAppState();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadMe();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    tokenStore.clear();
    setMsg("Hesabdan çıxış edildi ✅");
    await loadMe();
    nav("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-page__overlay"></div>

      <div className="profile-page__container">
        <div className="profile-page__card">
          <div className="profile-page__content">
            <h2 className="profile-page__title">Profil</h2>
            <p className="profile-page__subtitle">
              Hesab məlumatlarınızı buradan izləyə bilərsiniz
            </p>

            {!me ? (
              <div className="profile-page__guest">
                <p className="profile-page__guest-text">
                  Siz hazırda hesabınıza daxil olmamısınız.
                </p>

                <div className="profile-page__guest-actions">
                  <Link to="/login" className="profile-page__link-btn">
                    Login
                  </Link>
                  <Link to="/register" className="profile-page__link-btn profile-page__link-btn--secondary">
                    Register
                  </Link>
                </div>
              </div>
            ) : (
              <div className="profile-page__info">
                <div className="profile-page__info-row">
                  <span className="profile-page__label">İstifadəçi adı</span>
                  <span className="profile-page__value">{me.username}</span>
                </div>

                <div className="profile-page__info-row">
                  <span className="profile-page__label">Email ünvanı</span>
                  <span className="profile-page__value">{me.email}</span>
                </div>

                <div className="profile-page__info-row">
                  <span className="profile-page__label">Səbətdəki məhsul sayı</span>
                  <span className="profile-page__value">{me.cartCount}</span>
                </div>

                <div className="profile-page__info-row">
                  <span className="profile-page__label">Favori məhsul sayı</span>
                  <span className="profile-page__value">{me.favoritesCount}</span>
                </div>

                <div className="profile-page__actions">
                  <button
                    onClick={logout}
                    className="profile-page__button"
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {msg && <div className="profile-page__message">{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}