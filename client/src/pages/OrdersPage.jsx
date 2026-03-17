import { useEffect, useMemo, useState } from "react";
import { api } from "../api/http";
import {
  FaBoxOpen,
  FaCreditCard,
  FaCircleCheck,
  FaClock,
  FaTruck,
  FaReceipt,
  FaXmark,
  FaTriangleExclamation,
} from "react-icons/fa6";
import "./OrdersPage.css";

const CANCEL_LIMIT_DAYS = 3;
const HIDDEN_ORDERS_KEY = "hidden_orders";

const getHiddenOrders = () => {
  try {
    const raw = localStorage.getItem(HIDDEN_ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveHiddenOrders = (ids) => {
  try {
    localStorage.setItem(HIDDEN_ORDERS_KEY, JSON.stringify(ids));
  } catch {
    //
  }
};

const getOrderStatusMeta = (status = "") => {
  const value = status.toString().trim().toLowerCase();

  if (["paid", "confirmed", "processing", "preparing"].includes(value)) {
    return {
      label: "Hazırlanır",
      className: "is-processing",
      icon: <FaClock />,
    };
  }

  if (["shipped", "shipping", "in_transit"].includes(value)) {
    return {
      label: "Yoldadır",
      className: "is-shipping",
      icon: <FaTruck />,
    };
  }

  if (["delivered", "completed", "done"].includes(value)) {
    return {
      label: "Çatdırıldı",
      className: "is-delivered",
      icon: <FaCircleCheck />,
    };
  }

  if (["cancelled", "canceled", "failed"].includes(value)) {
    return {
      label: "Ləğv olunub",
      className: "is-cancelled",
      icon: <FaReceipt />,
    };
  }

  return {
    label: status || "Məlum deyil",
    className: "is-default",
    icon: <FaClock />,
  };
};

const getPaymentText = (payment) => {
  const provider = payment?.provider?.toString()?.trim();
  const status = payment?.status?.toString()?.trim()?.toLowerCase();

  let statusText = "Ödəniş məlumatı yoxdur";

  if (["paid", "succeeded", "success"].includes(status)) {
    statusText = "Ödənilib";
  } else if (["pending", "waiting", "unpaid"].includes(status)) {
    statusText = "Ödəniş gözlənilir";
  } else if (status === "failed") {
    statusText = "Ödəniş alınmayıb";
  }

  return provider ? `${statusText} • ${provider}` : statusText;
};

const getItemImage = (item) => {
  const raw =
    item?.imageUrl ||
    item?.image ||
    item?.product?.imageUrl ||
    item?.product?.image ||
    "";

  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  return `http://localhost:5000${raw}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const canCancelOrder = (createdAt) => {
  if (!createdAt) return false;

  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;

  const now = Date.now();
  const diff = now - created;
  const limit = CANCEL_LIMIT_DAYS * 24 * 60 * 60 * 1000;

  return diff <= limit;
};

const getRemainingCancelText = (createdAt) => {
  if (!createdAt) return "Ləğv etmə müddəti bitib";

  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "Ləğv etmə müddəti bitib";

  const limit = created + CANCEL_LIMIT_DAYS * 24 * 60 * 60 * 1000;
  const diff = limit - Date.now();

  if (diff <= 0) return "Ləğv etmə müddəti bitib";

  const totalHours = Math.ceil(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return `${days} gün ${hours} saat ərzində ləğv edə bilərsiniz`;
  }

  return `${hours} saat ərzində ləğv edə bilərsiniz`;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const load = async () => {
    try {
      const r = await api.get("/orders/me");
      const incomingOrders = Array.isArray(r.data) ? r.data : [];
      const hiddenIds = getHiddenOrders();

      const visibleOrders = incomingOrders.filter(
        (order) => !hiddenIds.includes(order._id)
      );

      setOrders(visibleOrders);
    } catch (e) {
      setMsg(e.response?.data?.message || "Sifarişləri görmək üçün daxil olun.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [orders]);

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setSelectedOrder(null);
    setIsCancelModalOpen(false);
  };

  const confirmCancelOrder = () => {
    if (!selectedOrder?._id) return;

    const hiddenIds = getHiddenOrders();

    if (!hiddenIds.includes(selectedOrder._id)) {
      saveHiddenOrders([...hiddenIds, selectedOrder._id]);
    }

    setOrders((prev) => prev.filter((order) => order._id !== selectedOrder._id));
    closeCancelModal();
  };

  return (
    <div className="orders-page">
      <div className="orders-page__container">
        <div className="orders-page__hero">
          <span className="orders-page__badge">Şəxsi kabinet</span>
          <h1 className="orders-page__title">Sifarişlərim</h1>
          <p className="orders-page__subtitle">
            Burada verdiyiniz sifarişləri, məhsulları, ödəniş vəziyyətini və ümumi
            məbləği rahat şəkildə görə bilərsiniz.
          </p>
        </div>

        {msg && <div className="orders-page__message">{msg}</div>}

        {!sortedOrders.length && !msg && (
          <div className="orders-page__empty">
            <div className="orders-page__empty-icon">
              <FaBoxOpen />
            </div>
            <h2>Sizin hələ sifarişiniz yoxdur</h2>
            <p>
              Məhsul sifariş etdikdən sonra bütün məlumatlar bu səhifədə görünəcək.
            </p>
          </div>
        )}

        <div className="orders-page__list">
          {sortedOrders.map((order, orderIndex) => {
            const statusMeta = getOrderStatusMeta(order.status);
            const paymentText = getPaymentText(order.payment);
            const createdDate = formatDate(order.createdAt);
            const totalItems = Array.isArray(order.items)
              ? order.items.reduce((sum, item) => sum + (item.qty || 0), 0)
              : 0;

            const isCancelable = canCancelOrder(order.createdAt);
            const cancelText = getRemainingCancelText(order.createdAt);

            return (
              <article key={order._id} className="orders-page__card">
                <div className="orders-page__card-top">
                  <div className="orders-page__card-left">
                    <div className="orders-page__card-number">
                      Sifariş #{sortedOrders.length - orderIndex}
                    </div>

                    <div className="orders-page__card-meta">
                      <span className="orders-page__card-meta-item">
                        <FaReceipt />
                        {createdDate || "Tarix yoxdur"}
                      </span>

                      <span className="orders-page__card-meta-item">
                        <FaBoxOpen />
                        {totalItems} məhsul
                      </span>
                    </div>
                  </div>

                  <div className="orders-page__card-right">
                    <div className="orders-page__card-total-box">
                      <span className="orders-page__card-total-label">
                        Ümumi məbləğ
                      </span>
                      <strong className="orders-page__card-total-value">
                        {order.total} ₼
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="orders-page__card-info-row">
                  <div
                    className={`orders-page__card-status ${statusMeta.className}`}
                  >
                    <span className="orders-page__card-status-icon">
                      {statusMeta.icon}
                    </span>
                    <span>{statusMeta.label}</span>
                  </div>

                  <div className="orders-page__card-payment">
                    <FaCreditCard />
                    <span>{paymentText}</span>
                  </div>
                </div>

                <div className="orders-page__items">
                  {Array.isArray(order.items) &&
                    order.items.map((item, idx) => {
                      const imageSrc = getItemImage(item);

                      return (
                        <div key={idx} className="orders-page__item">
                          <div className="orders-page__item-image-wrap">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={item.title || "Məhsul"}
                                className="orders-page__item-image"
                              />
                            ) : (
                              <div className="orders-page__item-no-image">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="orders-page__item-content">
                            <h3 className="orders-page__item-title">
                              {item.title || "Məhsul adı yoxdur"}
                            </h3>

                            {item.variantLabel && (
                              <div className="orders-page__item-variant">
                                Variant: {item.variantLabel}
                              </div>
                            )}

                            <div className="orders-page__item-details">
                              <span>Sayı: {item.qty}</span>
                              <span>Bir ədəd: {item.price} ₼</span>
                            </div>
                          </div>

                          <div className="orders-page__item-summary">
                            <div className="orders-page__item-qty">
                              x{item.qty}
                            </div>
                            <div className="orders-page__item-subtotal">
                              {(item.price || 0) * (item.qty || 0)} ₼
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="orders-page__card-bottom">
                  <div className="orders-page__card-bottom-left">
                    <div className="orders-page__card-id">
                      Sifariş ID: <span>{order._id}</span>
                    </div>

                    <div
                      className={`orders-page__card-cancel-note ${
                        isCancelable ? "is-active" : "is-expired"
                      }`}
                    >
                      {isCancelable
                        ? cancelText
                        : "Bu sifarişi artıq ləğv etmək olmur"}
                    </div>
                  </div>

                  <div className="orders-page__card-bottom-right">
                    <button
                      type="button"
                      className={`orders-page__card-cancel-btn ${
                        !isCancelable ? "is-disabled" : ""
                      }`}
                      onClick={() => isCancelable && openCancelModal(order)}
                      disabled={!isCancelable}
                    >
                      Sifarişi ləğv et
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {isCancelModalOpen && selectedOrder && (
        <div className="orders-page__modal-overlay" onClick={closeCancelModal}>
          <div
            className="orders-page__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="orders-page__modal-close"
              onClick={closeCancelModal}
              aria-label="Bağla"
            >
              <FaXmark />
            </button>

            <div className="orders-page__modal-icon">
              <FaTriangleExclamation />
            </div>

            <h3 className="orders-page__modal-title">
              Sifarişi ləğv etmək istəyirsiniz?
            </h3>

            <p className="orders-page__modal-text">
              Bu əməliyyatdan sonra sifariş siyahıdan silinəcək və refresh etdikdə
              də geri görünməyəcək.
            </p>

            <div className="orders-page__modal-info">
              <span>Sifariş ID:</span>
              <strong>{selectedOrder._id}</strong>
            </div>

            <div className="orders-page__modal-actions">
              <button
                type="button"
                className="orders-page__modal-btn orders-page__modal-btn--ghost"
                onClick={closeCancelModal}
              >
                Bağla
              </button>

              <button
                type="button"
                className="orders-page__modal-btn orders-page__modal-btn--danger"
                onClick={confirmCancelOrder}
              >
                Bəli, ləğv et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}