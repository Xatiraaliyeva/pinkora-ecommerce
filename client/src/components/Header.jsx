import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppState } from "../context/AppState";
import "./Header.css";
import logo from "../assets/logo.png";

function Header() {
  const { me, loadMe } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="site-header__blur"></div>

        <div className="site-header__container">
          <Link to="/" className="site-header__brand" onClick={closeMenu}>
            <img src={logo} alt="Pinkora logo" className="site-header__logo" />
            <span className="site-header__brand-text">Pinkora</span>
          </Link>

          <nav className="site-header__nav">
            <Link to="/" className="site-header__link">
              Ana Səhifə
            </Link>

            <Link
              to="/favorites"
              className="site-header__link site-header__link--badge"
            >
              Bəyənilənlər
              {me?.favoritesCount > 0 ? (
                <span className="site-header__count-badge">
                  {me.favoritesCount}
                </span>
              ) : null}
            </Link>

            <Link
              to="/cart"
              className="site-header__link site-header__link--badge"
            >
              Səbət
              {me?.cartCount > 0 ? (
                <span className="site-header__count-badge">
                  {me.cartCount}
                </span>
              ) : null}
            </Link>

            <Link to="/orders" className="site-header__link">
              Sifarişlərim
            </Link>

            {me?.role === "admin" ? (
              <Link to="/admin" className="site-header__link">
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="site-header__right">
            {!me ? (
              <div className="site-header__auth">
                <Link to="/login" className="site-header__auth-link">
                  Login
                </Link>

                <Link
                  to="/register"
                  className="site-header__auth-link site-header__auth-link--fill"
                >
                  Register
                </Link>
              </div>
            ) : (
              <Link to="/profile" className="site-header__profile">
                <span className="site-header__hello">
                  Hi, <b>{me?.username || "User"}</b>
                </span>

                <div className="site-header__icon-wrap">
                  <lord-icon
                    src="https://cdn.lordicon.com/kdduutaw.json"
                    trigger="loop"
                    delay="1800"
                    colors="primary:#7f5a63,secondary:#d49cab"
                    style={{ width: "42px", height: "42px" }}
                  ></lord-icon>
                </div>
              </Link>
            )}
          </div>

          <button
            className={`site-header__menu-btn ${menuOpen ? "is-active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu"
            type="button"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div
        className={`site-mobile-menu-backdrop ${menuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
      ></div>

      <aside className={`site-mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <div className="site-mobile-menu__top">
          <div className="site-mobile-menu__brand">
            <img
              src={logo}
              alt="Pinkora logo"
              className="site-mobile-menu__logo"
            />
            <span>Menu</span>
          </div>

          <button
            className="site-mobile-menu__close"
            onClick={closeMenu}
            type="button"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {me ? (
          <Link
            to="/profile"
            className="site-mobile-menu__profile"
            onClick={closeMenu}
          >
            <div className="site-mobile-menu__profile-icon">
              <lord-icon
                src="https://cdn.lordicon.com/kdduutaw.json"
                trigger="loop"
                delay="1800"
                colors="primary:#7f5a63,secondary:#d49cab"
                style={{ width: "40px", height: "40px" }}
              ></lord-icon>
            </div>

            <div className="site-mobile-menu__profile-text">
              <strong>{me?.username || "User"}</strong>
            </div>
          </Link>
        ) : (
          <div className="site-mobile-menu__auth">
            <Link
              to="/login"
              className="site-mobile-menu__auth-link"
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="site-mobile-menu__auth-link site-mobile-menu__auth-link--fill"
              onClick={closeMenu}
            >
              Register
            </Link>
          </div>
        )}

        <nav className="site-mobile-menu__nav">
          <Link to="/" className="site-mobile-menu__link" onClick={closeMenu}>
            Ana Səhifə
          </Link>

          <Link
            to="/favorites"
            className="site-mobile-menu__link"
            onClick={closeMenu}
          >
            <span>Bəyənilənlər</span>
            {me?.favoritesCount > 0 ? (
              <span className="site-mobile-menu__badge">{me.favoritesCount}</span>
            ) : null}
          </Link>

          <Link
            to="/cart"
            className="site-mobile-menu__link"
            onClick={closeMenu}
          >
            <span>Səbət</span>
            {me?.cartCount > 0 ? (
              <span className="site-mobile-menu__badge">{me.cartCount}</span>
            ) : null}
          </Link>

          <Link
            to="/orders"
            className="site-mobile-menu__link"
            onClick={closeMenu}
          >
            Sifarişlərim
          </Link>

          {me?.role === "admin" ? (
            <Link
              to="/admin"
              className="site-mobile-menu__link"
              onClick={closeMenu}
            >
              Admin Panel
            </Link>
          ) : null}
        </nav>
      </aside>
    </>
  );
}

export default Header;