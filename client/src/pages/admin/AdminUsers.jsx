import { useEffect, useState } from "react";
import { api } from "../../api/http";
import "./AdminUsers.css";

const SUPER_ADMIN_EMAIL = "xatiree81@gmail.com";

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [savingId, setSavingId] = useState("");

  const load = async () => {
    const r = await api.get("/admin/panel/users");
    setItems(r.data.items || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const del = async (id, email) => {
    if (email === SUPER_ADMIN_EMAIL) {
      alert("Main admin silinə bilməz");
      return;
    }

    if (!confirm("User silinsin?")) return;

    await api.delete(`/admin/panel/users/${id}`);
    await load();
  };

  const changeRole = async (id, email, role) => {
    if (email === SUPER_ADMIN_EMAIL) {
      alert("Main admin rolu dəyişdirilə bilməz");
      return;
    }

    try {
      setSavingId(id);
      await api.patch(`/admin/panel/users/${id}/role`, { role });
      await load();
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="admin-users">
      <div className="admin-users__top">
        <div className="admin-users__heading">
          <h2 className="admin-users__title">Users</h2>
          <p className="admin-users__subtitle">
            Sistemdə olan istifadəçiləri buradan idarə et, rolları dəyiş və lazım
            olduqda sil.
          </p>
        </div>

        <div className="admin-users__stats">
          <div className="admin-users__stat-card">
            <span className="admin-users__stat-label">Total users</span>
            <strong className="admin-users__stat-value">{items.length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-users__panel">
        <div className="admin-section-header">
          <h3 className="admin-section-header__title">User list</h3>
          <p className="admin-section-header__text">
            Hər istifadəçi üçün rol seçə və ya silmə əməliyyatı edə bilərsən.
          </p>
        </div>

        <div className="user-list">
          {items.map((u) => {
            const isMainAdmin = u.email === SUPER_ADMIN_EMAIL;
            const isSaving = savingId === u._id;

            return (
              <div key={u._id} className="user-item">
                <div className="user-item__top">
                  <div className="user-item__info">
                    <div className="user-item__top-row">
                      <h4 className="user-item__name">{u.username}</h4>

                      <span
                        className={`user-item__badge ${
                          isMainAdmin ? "user-item__badge--main" : ""
                        }`}
                      >
                        {isMainAdmin ? "Main admin" : u.role}
                      </span>
                    </div>

                    <p className="user-item__email">{u.email}</p>

                    <div className="user-item__meta">
                      <span>Role: {u.role}</span>
                      {isSaving && <span>Saving...</span>}
                    </div>
                  </div>

                  <div className="user-item__actions">
                    <select
                      className="user-item__select"
                      value={u.role}
                      disabled={isMainAdmin || isSaving}
                      onChange={(e) =>
                        changeRole(u._id, u.email, e.target.value)
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>

                    <button
                      className="user-item__delete-btn"
                      onClick={() => del(u._id, u.email)}
                      disabled={isMainAdmin || isSaving}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!items.length && (
            <div className="admin-users__state">User yoxdur.</div>
          )}
        </div>
      </div>
    </div>
  );
}