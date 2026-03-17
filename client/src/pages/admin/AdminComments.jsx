import { useEffect, useState } from "react";
import { api } from "../../api/http";
import { useToast } from "../../context/ToastContext";
import "./AdminComments.css";

export default function AdminComments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    user: "",
  });

  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const r = await api.get("/admin/panel/comments");
      setItems(r.data.items || []);
    } catch (e) {
      toast.error("Xəta baş verdi", "Şərhlər yüklənmədi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const openDeleteModal = (comment) => {
    setDeleteModal({
      open: true,
      id: comment._id,
      user: comment.user?.username || comment.user?.email || "User",
    });
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteModal({
      open: false,
      id: null,
      user: "",
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/admin/panel/comments/${deleteModal.id}`);
      toast.success("Uğurlu əməliyyat", "Şərh uğurla silindi.");
      closeDeleteModal();
      await load();
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Şərh silinmədi.";
      toast.error("Xəta baş verdi", errorMessage);
    } finally {
      setDeleteLoading(false);
      setDeleteModal((prev) => ({
        ...prev,
        open: false,
        id: null,
        user: "",
      }));
    }
  };

  return (
    <div className="admin-comments">
      <div className="admin-comments__header">
        <div className="admin-comments__header-content">
          <h2 className="admin-comments__title">Şərhlər</h2>
          <p className="admin-comments__subtitle">
            İstifadəçilərin yazdığı bütün şərhləri buradan izləyə və idarə edə
            bilərsiniz.
          </p>
        </div>

        <div className="admin-comments__count-box">
          <span className="admin-comments__count-label">Toplam şərh</span>
          <strong className="admin-comments__count-value">{items.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="admin-comments__state">Şərhlər yüklənir...</div>
      ) : items.length > 0 ? (
        <div className="admin-comments__list">
          {items.map((c) => (
            <div key={c._id} className="comment-card">
              <div className="comment-card__top">
                <div className="comment-card__user-info">
                  <div className="comment-card__avatar">
                    {(c.user?.username || c.user?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="comment-card__meta">
                    <h3 className="comment-card__username">
                      {c.user?.username || c.user?.email || "User"}
                    </h3>

                    <p className="comment-card__product">
                      Məhsul:
                      <span className="comment-card__product-name">
                        {" "}
                        {c.product?.title || "—"}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="comment-card__delete-btn"
                  onClick={() => openDeleteModal(c)}
                >
                  Sil
                </button>
              </div>

              <div className="comment-card__body">
                {c.text || c.comment || c.body || "Şərh mətni yoxdur."}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-comments__state">
          Hazırda sistemdə heç bir şərh yoxdur.
        </div>
      )}

      {deleteModal.open && (
        <div className="admin-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__icon">!</div>

            <h3 className="admin-modal__title">Şərhi silmək istəyirsiniz?</h3>

            <p className="admin-modal__text">
              <strong>{deleteModal.user}</strong> istifadəçisinin bu şərhi
              sistemdən silinəcək. Bu əməliyyatı geri qaytarmaq olmaya bilər.
            </p>

            <div className="admin-modal__actions">
              <button
                type="button"
                className="admin-modal__btn admin-modal__btn--cancel"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Ləğv et
              </button>

              <button
                type="button"
                className="admin-modal__btn admin-modal__btn--delete"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Silinir..." : "Bəli, sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}