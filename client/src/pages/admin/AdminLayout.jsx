import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/comments", label: "Comments" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <div className="admin-layout__bg"></div>

      <div className="admin-layout__container">
        <header className="admin-layout__header">
          <div className="admin-layout__branding">
            <span className="admin-layout__eyebrow">Management System</span>
            <h1 className="admin-layout__title">Admin Panel</h1>
            <p className="admin-layout__subtitle">
              Məhsullar, sifarişlər, şərhlər və istifadəçiləri buradan idarə et.
            </p>
          </div>
        </header>

        <nav className="admin-layout__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-layout__nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}