import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaHeart,
  FaReply,
  FaTrashAlt,
  FaPaperPlane,
  FaShoppingCart,
} from "react-icons/fa";
import { api } from "../api/http";
import { useAppState } from "../context/AppState";
import { useToast } from "../context/ToastContext";
import "./ProductPage.css";

function CommentItem({ c, onReply, onLike, onDelete, depth = 0 }) {
  return (
    <div
      className={`comment-item ${depth > 0 ? "comment-item--reply" : ""}`}
      style={{ marginLeft: depth > 0 ? depth * 18 : 0 }}
    >
      <div className="comment-item__head">
        <b className="comment-item__user">{c.user?.username || "user"}</b>
        <span className="comment-item__date">
          {new Date(c.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="comment-item__text">{c.text}</div>

      <div className="comment-item__actions">
        <button
          type="button"
          className="comment-action-btn"
          onClick={() => onLike(c._id)}
        >
          <FaHeart className="comment-action-btn__icon" />
          <span>{c.likeCount || 0}</span>
        </button>

        <button
          type="button"
          className="comment-action-btn"
          onClick={() => onReply({ id: c._id })}
        >
          <FaReply className="comment-action-btn__icon" />
          <span>Reply</span>
        </button>

        <button
          type="button"
          className="comment-action-btn comment-action-btn--delete"
          onClick={() => onDelete(c._id)}
        >
          <FaTrashAlt className="comment-action-btn__icon" />
          <span>Delete</span>
        </button>
      </div>

      {c.replies?.length > 0 && (
        <div className="comment-item__replies">
          {c.replies.map((r) => (
            <CommentItem
              key={r._id}
              c={r}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const { loadMe } = useAppState();
  const toast = useToast();

  const [p, setP] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [msg, setMsg] = useState("");

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const selectedVariant = useMemo(() => {
    if (!p?.variants?.length) return null;
    return p.variants.find((v) => v._id === selectedVariantId) || null;
  }, [p, selectedVariantId]);

  const allImages = useMemo(() => {
    const variantImages = selectedVariant
      ? [selectedVariant.imageUrl, ...(selectedVariant.images || [])].filter(Boolean)
      : [];

    const baseImages = [p?.imageUrl, ...(p?.gallery || [])].filter(Boolean);

    return [...new Set([...variantImages, ...baseImages])];
  }, [p, selectedVariant]);

  const currentPrice = selectedVariant?.price ?? p?.price ?? 0;

  const load = async () => {
    try {
      const pr = await api.get(`/products/${id}`);
      const product = pr.data;
      setP(product);

      const defaultVariant =
        product?.variants?.find((v) => v.isDefault) ||
        product?.variants?.[0] ||
        null;

      setSelectedVariantId(defaultVariant?._id || "");
      setSelectedImage(
        defaultVariant?.imageUrl ||
          defaultVariant?.images?.[0] ||
          product?.imageUrl ||
          product?.gallery?.[0] ||
          ""
      );

      const cr = await api.get(`/comments/${id}`);
      setComments(cr.data);
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Məhsul yüklənmədi";
      setMsg(errorMessage);
      toast.error("Xəta baş verdi", errorMessage);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (allImages.length && !allImages.includes(selectedImage)) {
      setSelectedImage(allImages[0]);
    }
  }, [allImages, selectedImage]);

  const add = async () => {
    if (!text.trim()) return;

    setMsg("");
    try {
      await api.post(`/comments/${id}`, {
        text,
        parent: replyTo?.id || null,
      });
      setText("");
      setReplyTo(null);
      await load();
      toast.success("Şərh əlavə olundu", "Rəyiniz uğurla göndərildi.");
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Login lazımdır";
      setMsg(errorMessage);
      toast.error("Şərh göndərilmədi", errorMessage);
    }
  };

  const like = async (commentId) => {
    setMsg("");
    try {
      await api.post(`/comments/by-id/${commentId}/like`);
      await load();
      toast.success("Bəyənildi", "Şərh bəyənilənlərə əlavə olundu.");
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Login lazımdır";
      setMsg(errorMessage);
      toast.error("Əməliyyat alınmadı", errorMessage);
    }
  };

  const del = async (commentId) => {
    setMsg("");
    try {
      await api.delete(`/comments/by-id/${commentId}`);
      await load();
      toast.success("Şərh silindi", "Seçilən şərh uğurla silindi.");
    } catch (e) {
      const errorMessage =
        e.response?.data?.message || "Yalnız öz commentini silə bilərsən";
      setMsg(errorMessage);
      toast.error("Şərh silinmədi", errorMessage);
    }
  };

  const addToCart = async () => {
    setMsg("");
    try {
      await api.post("/cart/add", {
        productId: p._id,
        qty: 1,
        variantId: selectedVariantId || "",
      });
      await loadMe();
      setMsg("Səbətə əlavə olundu ✅");
      toast.success(
        "Səbətə əlavə olundu",
        "Məhsul səbətinizə uğurla əlavə edildi."
      );
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Login lazımdır";
      setMsg(errorMessage);
      toast.error("Məhsul səbətə əlavə olunmadı", errorMessage);
    }
  };

  if (!p) return <div className="product-page__loading">Loading...</div>;

  return (
    <div className="product-page">
      <div className="product-page__container">
        <div className="product-page__top-card">
          <div className="product-page__hero-grid">
            <div className="product-gallery">
              <div className="product-gallery__main">
                {selectedImage ? (
                  <img
                    src={`http://localhost:5000${selectedImage}`}
                    alt={p.title}
                    className="product-gallery__main-image"
                  />
                ) : null}
              </div>

              {allImages.length > 0 && (
                <div className="product-gallery__thumbs">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`product-gallery__thumb ${
                        selectedImage === img ? "is-active" : ""
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${img}`}
                        alt=""
                        className="product-gallery__thumb-image"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-info">
              <span className="product-info__orb product-info__orb--one" />
              <span className="product-info__orb product-info__orb--two" />
              <span className="product-info__orb product-info__orb--three" />

              <div className="product-info__inner">
                <div className="product-info__top">
                  {p.category && (
                    <span className="product-info__meta-chip">
                      {p.category}
                    </span>
                  )}

                  <h1 className="product-info__title">{p.title}</h1>

                  <p className="product-info__desc">{p.desc}</p>

                  {p.brand && (
                    <div className="product-info__brand-line">
                      <span className="product-info__brand-label">Brend</span>
                      <span className="product-info__brand-value">{p.brand}</span>
                    </div>
                  )}

                  {!!p.variants?.length && (
                    <div className="product-info__variants">
                      <div className="product-info__variants-title">
                        Rəng: {selectedVariant?.colorName || "Seçilməyib"}
                      </div>

                      <div className="product-info__variant-list">
                        {p.variants.map((variant) => (
                          <button
                            key={variant._id}
                            type="button"
                            onClick={() => {
                              setSelectedVariantId(variant._id);
                              setSelectedImage(
                                variant.imageUrl ||
                                  variant.images?.[0] ||
                                  p.imageUrl ||
                                  p.gallery?.[0] ||
                                  ""
                              );
                            }}
                            className={`product-info__variant-btn ${
                              selectedVariantId === variant._id ? "is-active" : ""
                            }`}
                          >
                            <span className="product-info__variant-inner">
                              <span
                                className="product-info__variant-color"
                                style={{ background: variant.colorHex || "#ddd" }}
                              />
                              <span>{variant.colorName}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="product-info__bottom">
                    <div className="product-info__price">{currentPrice} ₼</div>

                    <button
                      type="button"
                      onClick={addToCart}
                      className="product-info__cart-btn"
                    >
                      <FaShoppingCart />
                      <span>Səbətə at</span>
                    </button>
                  </div>

                  {msg && <div className="product-info__message">{msg}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-comments">
          <h3 className="product-comments__title">Comments</h3>

          <div className="product-comments__composer">
            {replyTo && (
              <div className="product-comments__reply-pill">
                <div className="product-comments__reply-pill-left">
                  <span className="product-comments__reply-dot" />
                  <span>Reply mode aktivdir</span>
                </div>

                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="product-comments__reply-pill-btn"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="product-comments__input-row">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Şərh yaz..."
                rows={1}
                className="product-comments__input"
              />

              <button
                type="button"
                onClick={add}
                className="product-comments__send-btn"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="product-comments__empty">Hələ şərh yoxdur.</div>
          ) : (
            <div className="product-comments__list">
              {comments.map((c) => (
                <CommentItem
                  key={c._id}
                  c={c}
                  onReply={setReplyTo}
                  onLike={like}
                  onDelete={del}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}