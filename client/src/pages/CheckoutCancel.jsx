import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaXmark,
  FaArrowRotateLeft,
  FaHouse,
  FaCartShopping,
} from "react-icons/fa6";
import "./CheckoutCancel.css";

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-cancel-page">
      <div className="checkout-cancel-page__container">
        <section className="checkout-cancel-page__hero">
          <span className="checkout-cancel-page__badge">Ödəniş nəticəsi</span>

          <h1 className="checkout-cancel-page__title">Ödəniş ləğv edildi</h1>

          <p className="checkout-cancel-page__subtitle">
            Ödəniş prosesi tamamlanmadı. İstəsəniz yenidən cəhd edə və ya ana
            səhifəyə qayıda bilərsiniz.
          </p>
        </section>

        <section className="checkout-cancel-card">
          <div className="checkout-cancel-card__icon">
            <FaXmark />
          </div>

          <h2 className="checkout-cancel-card__title">
            Sifariş tamamlanmadı
          </h2>

          <p className="checkout-cancel-card__text">
            Narahat olmayın, ödəniş uğurla başa çatmadığı üçün sifariş
            tamamlanmamış hesab olunur. Məhsulları yenidən yoxlayıb təkrar
            ödəniş edə bilərsiniz.
          </p>

          <div className="checkout-cancel-card__info">
            <div className="checkout-cancel-card__info-item">
              <span>Vəziyyət</span>
              <strong>Ləğv edildi</strong>
            </div>

            <div className="checkout-cancel-card__info-item">
              <span>Növbəti addım</span>
              <strong>Yenidən cəhd edin</strong>
            </div>
          </div>

          <div className="checkout-cancel-card__actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="checkout-cancel-btn checkout-cancel-btn--ghost"
            >
              <FaArrowRotateLeft />
              <span>Geri qayıt</span>
            </button>

            <Link
              to="/"
              className="checkout-cancel-btn checkout-cancel-btn--primary"
            >
              <FaHouse />
              <span>Ana səhifə</span>
            </Link>

            <Link
              to="/cart"
              className="checkout-cancel-btn checkout-cancel-btn--secondary"
            >
              <FaCartShopping />
              <span>Səbətə bax</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CheckoutCancel;