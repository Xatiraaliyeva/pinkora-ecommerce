import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard__hero">
        <div className="admin-dashboard__hero-content">
          <span className="admin-dashboard__eyebrow">Admin panel</span>
          <h2 className="admin-dashboard__title">İdarəetmə paneli</h2>
          <p className="admin-dashboard__subtitle">
            Buradan məhsulları, şərhləri və istifadəçiləri idarə edə bilərsən.
          </p>
        </div>

        <div className="admin-dashboard__hero-badge">
          <span className="admin-dashboard__hero-badge-label">Panel</span>
          <strong className="admin-dashboard__hero-badge-value">Admin</strong>
        </div>
      </div>

      <div className="admin-dashboard__grid">
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__icon">📦</div>
          <h3 className="admin-dashboard__card-title">Məhsullar</h3>
          <p className="admin-dashboard__card-text">
            Məhsul əlavə et, düzəliş et və siyahını idarə et.
          </p>
        </div>

        <div className="admin-dashboard__card">
          <div className="admin-dashboard__icon">💬</div>
          <h3 className="admin-dashboard__card-title">Şərhlər</h3>
          <p className="admin-dashboard__card-text">
            İstifadəçi rəylərini və şərhləri yoxla.
          </p>
        </div>

        <div className="admin-dashboard__card">
          <div className="admin-dashboard__icon">👤</div>
          <h3 className="admin-dashboard__card-title">İstifadəçilər</h3>
          <p className="admin-dashboard__card-text">
            İstifadəçi siyahısını gör və rolları idarə et.
          </p>
        </div>
      </div>

      <div className="admin-dashboard__info">
        <h3 className="admin-dashboard__info-title">Qısa məlumat</h3>
        <p className="admin-dashboard__info-text">
          Bu panel ümumi idarəetmə üçündür. Sol menyudan istədiyin bölməyə keçib
          əməliyyatları rahat şəkildə edə bilərsən.
        </p>
      </div>
    </section>
  );
}