import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaRegCommentDots,
  FaTrashCan,
  FaBasketShopping,
  FaHeart,
} from "react-icons/fa6";
import { api } from "../api/http";
import { useAppState } from "../context/AppState";
import { useToast } from "../context/ToastContext";
import "./FavoritesPage.css";

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const { loadMe } = useAppState();
  const toast = useToast();

  const load = async () => {
    try {
      const r = await api.get("/products/me/favorites/list");
      setItems(r.data);
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Login lazımdır";
      setMsg(errorMessage);
      toast.error("Xəta baş verdi", errorMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeFav = async (id) => {
    setMsg("");
    try {
      await api.post(`/products/${id}/favorite`);
      await load();
      await loadMe();
      toast.success(
        "Favorilərdən silindi",
        "Məhsul favorilər siyahısından çıxarıldı."
      );
    } catch (e) {
      const errorMessage =
        e.response?.data?.message || "Favoridən silinmədi";
      setMsg(errorMessage);
      toast.error("Əməliyyat alınmadı", errorMessage);
    }
  };

  const addToCart = async (id) => {
    setMsg("");
    try {
      await api.post("/cart/add", { productId: id, qty: 1 });
      await loadMe();
      toast.success(
        "Səbətə əlavə olundu",
        "Məhsul səbətinizə uğurla əlavə edildi."
      );
    } catch (e) {
      const errorMessage =
        e.response?.data?.message || "Login lazımdır (cart üçün)";
      setMsg(errorMessage);
      toast.error("Əməliyyat alınmadı", errorMessage);
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-page__container">
        <section className="favorites-page__hero">
          <div className="favorites-page__hero-content">
            <span className="favorites-page__badge">Seçilmiş məhsullar</span>
            <h2 className="favorites-page__title">Favorilər</h2>
            <p className="favorites-page__subtitle">
              Bəyəndiyiniz məhsulları burada izləyə, məhsul səhifəsinə keçə və
              səbətə əlavə edə bilərsiniz.
            </p>
          </div>

          <div className="favorites-page__floating-hearts" aria-hidden="true">
            <span className="favorites-page__heart favorites-page__heart--1">
              <FaHeart />
            </span>
            <span className="favorites-page__heart favorites-page__heart--2">
              <FaHeart />
            </span>
            <span className="favorites-page__heart favorites-page__heart--3">
              <FaHeart />
            </span>
            <span className="favorites-page__heart favorites-page__heart--4">
              <FaHeart />
            </span>
          </div>
        </section>

        {msg && <div className="favorites-page__message">{msg}</div>}

        {items.length === 0 ? (
          <div className="favorites-page__empty">
            <div className="favorites-page__empty-icon">
              <FaHeart />
            </div>
            <h3 className="favorites-page__empty-title">Favori yoxdur</h3>
            <p className="favorites-page__empty-text">
              Hələ ki favorilər siyahısına məhsul əlavə etməmisiniz.
            </p>
          </div>
        ) : (
          <div className="favorites-page__grid">
            {items.map((p) => (
              <article key={p._id} className="favorite-card">
                <Link to={`/p/${p._id}`} className="favorite-card__image-link">
                  <div className="favorite-card__image-wrap">
                    {p.imageUrl ? (
                      <img
                        src={`http://localhost:5000${p.imageUrl}`}
                        alt={p.title}
                        className="favorite-card__image"
                      />
                    ) : (
                      <div className="favorite-card__no-image">No image</div>
                    )}
                  </div>
                </Link>

                <div className="favorite-card__body">
                  <div className="favorite-card__price-row">
                    <Link
                      to={`/p/${p._id}`}
                      className="favorite-card__title-link"
                    >
                      <h3 className="favorite-card__title">{p.title}</h3>
                    </Link>

                    <span className="favorite-card__price">{p.price} ₼</span>
                  </div>

                  <div className="favorite-card__actions">
                    <Link
                      to={`/p/${p._id}`}
                      className="favorite-card__btn favorite-card__btn--comment"
                      aria-label="Comment"
                    >
                      <FaRegCommentDots className="favorite-card__icon" />
                      <span>Comment</span>
                    </Link>

                    <button
                      onClick={() => removeFav(p._id)}
                      className="favorite-card__btn favorite-card__btn--delete"
                      aria-label="Delete"
                      type="button"
                    >
                      <FaTrashCan className="favorite-card__icon favorite-card__icon--heart" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => addToCart(p._id)}
                      className="favorite-card__btn favorite-card__btn--cart"
                      aria-label="Basket"
                      type="button"
                    >
                      <FaBasketShopping className="favorite-card__icon" />
                      <span>Səbət</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
