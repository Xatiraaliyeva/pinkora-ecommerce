import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/http";
import { useAppState } from "../context/AppState";
import "./CheckoutSuccess.css";

const CheckoutSuccess = () => {
  const [sp] = useSearchParams();
  const sessionId = useMemo(() => sp.get("session_id"), [sp]);
  const [state, setState] = useState({
    loading: true,
    order: null,
    msg: "",
  });
  const { loadMe } = useAppState();

  useEffect(() => {
    const run = async () => {
      try {
        if (!sessionId) {
          setState({
            loading: false,
            order: null,
            msg: "session_id tapılmadı",
          });
          return;
        }

        const r = await api.post("/payment/confirm", { sessionId });

        setState({
          loading: false,
          order: r.data?.order || null,
          msg: "",
        });

        await loadMe();
      } catch (e) {
        setState({
          loading: false,
          order: null,
          msg: e.response?.data?.message || "Confirm error",
        });
      }
    };

    run();
  }, [sessionId, loadMe]);

  return (
    <div className="checkout-success-page">
      <div className="checkout-success-page__container">
        <section className="checkout-success-page__hero">
          <div className="checkout-success-page__badge">
            Payment status
          </div>

          <h1 className="checkout-success-page__title">
            ✅ Ödəniş uğurla tamamlandı!
          </h1>

          {state.loading ? (
            <div className="checkout-success-page__message">
              Order təsdiqlənir...
            </div>
          ) : state.msg ? (
            <div className="checkout-success-page__message checkout-success-page__message--error">
              {state.msg}
            </div>
          ) : (
            <>
              <p className="checkout-success-page__subtitle">
                Sifariş yaradıldı və ödəniş statusu uğurla yoxlanıldı.
              </p>

              {state.order ? (
                <div className="checkout-success-card">
                  <div className="checkout-success-card__row">
                    <span className="checkout-success-card__label">Order ID</span>
                    <span className="checkout-success-card__value">
                      {state.order._id}
                    </span>
                  </div>

                  <div className="checkout-success-card__row">
                    <span className="checkout-success-card__label">Status</span>
                    <span className="checkout-success-card__value checkout-success-card__status">
                      {state.order.status}
                    </span>
                  </div>

                  <div className="checkout-success-card__row">
                    <span className="checkout-success-card__label">Total</span>
                    <span className="checkout-success-card__value checkout-success-card__total">
                      {state.order.total}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="checkout-success-page__actions">
                <Link
                  to="/orders"
                  className="checkout-success-page__btn"
                >
                  Sifarişlərim səhifəsinə keç
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default CheckoutSuccess;