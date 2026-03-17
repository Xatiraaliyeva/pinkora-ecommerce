import { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaTrashCan, FaCreditCard, FaBasketShopping, FaBoxOpen } from "react-icons/fa6";
import { api } from "../api/http";
import { useAppState } from "../context/AppState";
import { useToast } from "../context/ToastContext";
import "./CartPage.css";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [msg, setMsg] = useState("");
  const { loadMe } = useAppState();
  const toast = useToast();

  const [ship, setShip] = useState({
    fullName: "",
    phone: "",
    city: "",
    address1: "",
    address2: "",
    postalCode: "",
    notes: "",
  });

  const load = async () => {
    try {
      const r = await api.get("/cart");
      setCart(r.data);
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Login lazımdır";
      setMsg(errorMessage);
      toast.error("Səbət yüklənmədi", errorMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setQty = async (productId, qty, variantId = "") => {
    setMsg("");
    try {
      const r = await api.post("/cart/qty", { productId, qty, variantId });
      setCart(r.data);
      await loadMe();
      toast.success("Səbət yeniləndi", "Məhsul sayı uğurla dəyişdirildi.");
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Error";
      setMsg(errorMessage);
      toast.error("Miqdar dəyişmədi", errorMessage);
    }
  };

  const remove = async (productId, variantId = "") => {
    setMsg("");
    try {
      const r = await api.delete(
        `/cart/remove/${productId}?variantId=${variantId}`
      );
      setCart(r.data);
      await loadMe();
      toast.success("Məhsul silindi", "Məhsul səbətdən uğurla çıxarıldı.");
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Error";
      setMsg(errorMessage);
      toast.error("Silinmə alınmadı", errorMessage);
    }
  };

  const stripeCheckout = async () => {
    setMsg("");
    try {
      const r = await api.post("/payment/create-cart-checkout-session", {
        shippingAddress: ship,
      });
      const url = r.data?.url;
      if (!url) throw new Error("Stripe url not returned");

      toast.success(
        "Ödənişə keçid edilir",
        "Stripe ödəniş səhifəsinə yönləndirilirsiniz."
      );
      window.location.href = url;
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Error";
      setMsg(errorMessage);
      toast.error("Ödəniş başlamadı", errorMessage);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-page__container">
        <section className="cart-page__hero">
          <div className="cart-page__hero-content">
            <span className="cart-page__badge">Sifariş və məhsullar</span>
            <h1 className="cart-page__title">Səbət</h1>
            <p className="cart-page__subtitle">
              Səbətinizdəki məhsulları idarə edin, ümumi məbləği yoxlayın və sifarişi rahat şəkildə tamamlayın.
            </p>
          </div>

          <div className="cart-page__hero-icon-wrap" aria-hidden="true">
            <FaBasketShopping className="cart-page__hero-icon" />
          </div>
        </section>

        {msg && <div className="cart-page__message">{msg}</div>}

        {cart.items.length === 0 ? (
          <div className="cart-page__empty">
            <div className="cart-page__empty-icon">
              <FaBoxOpen />
            </div>
            <h3 className="cart-page__empty-title">Səbət boşdur</h3>
            <p className="cart-page__empty-text">
              Hələ ki səbətinizə məhsul əlavə etməmisiniz.
            </p>
          </div>
        ) : (
          <>
            <section className="cart-section">
              <div className="cart-section__head">
                <h2 className="cart-section__title">Səbətdəki məhsullar</h2>
                <span className="cart-section__count">{cart.count} məhsul</span>
              </div>

              <div className="cart-list">
                {cart.items.map((i) => (
                  <article
                    key={`${i.productId}_${i.variantId || "base"}`}
                    className="cart-card"
                  >
                    <div className="cart-card__image-wrap">
                      {i.imageUrl ? (
                        <img
                          src={`http://localhost:5000${i.imageUrl}`}
                          alt={i.title}
                          className="cart-card__image"
                        />
                      ) : (
                        <div className="cart-card__no-image">No image</div>
                      )}
                    </div>

                    <div className="cart-card__content">
                      <div className="cart-card__top">
                        <div className="cart-card__info">
                          <h3 className="cart-card__title">{i.title}</h3>

                          {i.variantLabel && (
                            <div className="cart-card__variant">
                              Rəng: {i.variantLabel}
                            </div>
                          )}

                          <div className="cart-card__controls-row">
                            <div className="cart-card__price">{i.price} ₼</div>

                            <div className="cart-card__qty">
                              <button
                                onClick={() =>
                                  setQty(i.productId, i.qty - 1, i.variantId)
                                }
                                className="cart-card__qty-btn"
                                type="button"
                                aria-label="Azalt"
                              >
                                <FaMinus />
                              </button>

                              <b className="cart-card__qty-value">{i.qty}</b>

                              <button
                                onClick={() =>
                                  setQty(i.productId, i.qty + 1, i.variantId)
                                }
                                className="cart-card__qty-btn"
                                type="button"
                                aria-label="Artır"
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="cart-card__amount">
                          <span className="cart-card__amount-label">Məbləğ</span>
                          <strong className="cart-card__amount-value">
                            {i.lineTotal} ₼
                          </strong>
                        </div>
                      </div>

                      <div className="cart-card__bottom">
                        <button
                          onClick={() => remove(i.productId, i.variantId)}
                          className="cart-card__remove"
                          type="button"
                        >
                          <FaTrashCan />
                          <span>Sil</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="cart-summary">
              <div className="cart-summary__head">
                <h2 className="cart-summary__title">Sifariş xülasəsi</h2>
                <span className="cart-summary__count">{cart.count} məhsul</span>
              </div>

              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>Məhsullar</span>
                  <strong>{cart.count}</strong>
                </div>

                <div className="cart-summary__row">
                  <span>Ümumi məbləğ</span>
                  <strong>{cart.total} ₼</strong>
                </div>
              </div>
            </section>

            <section className="cart-form">
              <div className="cart-form__head">
                <h2 className="cart-form__title">Çatdırılma məlumatları</h2>
                <p className="cart-form__subtitle">
                  Sifarişi tamamlamaq üçün məlumatları daxil edin.
                </p>
              </div>

              <div className="cart-form__grid">
                <input
                  className="cart-input"
                  placeholder="Ad Soyad"
                  value={ship.fullName}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, fullName: e.target.value }))
                  }
                />

                <input
                  className="cart-input"
                  placeholder="Telefon"
                  value={ship.phone}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, phone: e.target.value }))
                  }
                />

                <input
                  className="cart-input"
                  placeholder="Şəhər"
                  value={ship.city}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, city: e.target.value }))
                  }
                />

                <input
                  className="cart-input"
                  placeholder="Poçt kodu (opsional)"
                  value={ship.postalCode}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, postalCode: e.target.value }))
                  }
                />

                <input
                  className="cart-input cart-input--full"
                  placeholder="Ünvan"
                  value={ship.address1}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, address1: e.target.value }))
                  }
                />

                <input
                  className="cart-input cart-input--full"
                  placeholder="Mənzil / əlavə ünvan (opsional)"
                  value={ship.address2}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, address2: e.target.value }))
                  }
                />

                <textarea
                  className="cart-input cart-input--full cart-input--textarea"
                  placeholder="Qeyd (opsional)"
                  value={ship.notes}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, notes: e.target.value }))
                  }
                />
              </div>

              <div className="cart-form__actions">
                <button
                  onClick={stripeCheckout}
                  className="cart-pay-btn"
                  type="button"
                >
                  <FaCreditCard />
                  <span>Stripe ilə ödə</span>
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
