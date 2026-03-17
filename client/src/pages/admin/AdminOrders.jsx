import { useEffect, useState } from "react";
import { api } from "../../api/http";
import "./AdminOrders.css";

const STATUSES = ["pending", "paid"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setMsg("");
    try {
      const r = await api.get(
        `/admin/panel/orders${statusFilter ? `?status=${statusFilter}` : ""}`
      );
      setOrders(r.data.items || []);
    } catch (e) {
      setMsg(e.response?.data?.message || "Yükləmə xətası");
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateOrder = async (id, patch) => {
    setMsg("");
    try {
      await api.patch(`/admin/panel/orders/${id}`, patch);
      await load();
    } catch (e) {
      setMsg(e.response?.data?.message || "Yeniləmə xətası");
    }
  };

  return (
    <section className="admin-orders">
      <div className="admin-orders__header">
        <div>
          <h2 className="admin-orders__title">Sifarişlər</h2>
          <p className="admin-orders__subtitle">
            Sifarişləri görüntülə, statusu dəyiş və yenilə.
          </p>
        </div>

        <div className="admin-orders__count-card">
          <span className="admin-orders__count-label">Cəmi sifariş</span>
          <strong className="admin-orders__count-value">{orders.length}</strong>
        </div>
      </div>

      {msg ? <div className="admin-orders__message">{msg}</div> : null}

      <div className="admin-orders__toolbar">
        <div className="admin-orders__filters">
          <button
            type="button"
            className={`admin-orders__filter-btn ${
              statusFilter === "" ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter("")}
          >
            Hamısı
          </button>

          <button
            type="button"
            className={`admin-orders__filter-btn ${
              statusFilter === "pending" ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>

          <button
            type="button"
            className={`admin-orders__filter-btn ${
              statusFilter === "paid" ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter("paid")}
          >
            Paid
          </button>
        </div>

        <button type="button" className="admin-orders__refresh-btn" onClick={load}>
          Yenilə
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="admin-orders__empty">Sifariş yoxdur</div>
      ) : (
        <div className="admin-orders__list">
          {orders.map((o) => (
            <OrderCard key={o._id} o={o} onUpdate={updateOrder} />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderCard({ o, onUpdate }) {
  const [local, setLocal] = useState({
    status: o.status || "pending",
    carrier: o.shipping?.carrier || "",
    trackingNumber: o.shipping?.trackingNumber || "",
  });

  useEffect(() => {
    setLocal({
      status: o.status || "pending",
      carrier: o.shipping?.carrier || "",
      trackingNumber: o.shipping?.trackingNumber || "",
    });
  }, [o]);

  const fullName =
    o.shippingAddress?.fullName ||
    o.user?.username ||
    o.customer?.username ||
    "İstifadəçi";

  const email = o.user?.email || o.customer?.email || "-";
  const phone = o.shippingAddress?.phone || "-";
  const city = o.shippingAddress?.city || "-";
  const postalCode = o.shippingAddress?.postalCode || "";
  const address1 = o.shippingAddress?.address1 || "";
  const address2 = o.shippingAddress?.address2 || "";

  return (
    <article className="order-card">
      <div className="order-card__top">
        <div className="order-card__left">
          <div className="order-card__badges">
            <span className="order-card__badge">Status: {o.status}</span>
            <span className="order-card__badge">Ödəniş: {o.payment?.status || "-"}</span>
            <span className="order-card__badge">Cəm: {o.total}</span>
          </div>

          <h3 className="order-card__id">Sifariş #{String(o._id).slice(-8)}</h3>

          <p className="order-card__date">
            Tarix: {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
          </p>
        </div>

        <div className="order-card__right">
          <select
            className="order-card__select"
            value={local.status}
            onChange={(e) =>
              setLocal((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            className="order-card__input"
            type="text"
            placeholder="Kargo"
            value={local.carrier}
            onChange={(e) =>
              setLocal((prev) => ({ ...prev, carrier: e.target.value }))
            }
          />

          <input
            className="order-card__input"
            type="text"
            placeholder="Tracking nömrəsi"
            value={local.trackingNumber}
            onChange={(e) =>
              setLocal((prev) => ({ ...prev, trackingNumber: e.target.value }))
            }
          />

          <button
            type="button"
            className="order-card__save-btn"
            onClick={() => onUpdate(o._id, local)}
          >
            Yadda saxla
          </button>
        </div>
      </div>

      <div className="order-card__grid">
        <div className="order-box">
          <h4 className="order-box__title">İstifadəçi</h4>
          <div className="order-box__content">
            <p><strong>Ad:</strong> {fullName}</p>
            <p className="order-box__break"><strong>Email:</strong> {email}</p>
            <p><strong>Telefon:</strong> {phone}</p>
          </div>
        </div>

        <div className="order-box">
          <h4 className="order-box__title">Çatdırılma ünvanı</h4>
          <div className="order-box__content">
            <p>{city} {postalCode}</p>
            <p>{address1}</p>
            {address2 ? <p>{address2}</p> : null}
          </div>
        </div>
      </div>

      <div className="order-box order-box--full">
        <h4 className="order-box__title">Məhsullar</h4>
        <div className="order-products">
          {o.items?.length ? (
            o.items.map((i, idx) => (
              <div key={idx} className="order-products__item">
                <span className="order-products__name">{i.title}</span>
                <span className="order-products__meta">
                  {i.qty} ədəd × {i.price}
                </span>
                <span className="order-products__total">
                  {Number(i.price) * Number(i.qty)}
                </span>
              </div>
            ))
          ) : (
            <div className="order-products__empty">Məhsul yoxdur</div>
          )}
        </div>
      </div>
    </article>
  );
}