import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaRegCommentDots,
  FaRegHeart,
  FaHeart,
  FaBasketShopping,
} from "react-icons/fa6";
import { api } from "../api/http";
import { useAppState } from "../context/AppState";
import { useToast } from "../context/ToastContext";
import "./HomePage.css";

const FILTERS = ["Hamısı", "Accesories", "Care", "Makeup", "Parfume"];

const HERO_SLIDES = [
  {
    category: "Hamısı",
    badge: "Yeni kolleksiya",
    title: "Bütün məhsullar",
    subtitle:
      "Bütün kateqoriyalardakı məhsulları bir yerdən izləyin, bəyənin və səbətə əlavə edin.",
    buttonText: "Hamısına bax",
  },
  {
    category: "Accesories",
    badge: "Trend seçimlər",
    title: "Accesories kolleksiyası",
    subtitle:
      "Gündəlik görünüşünüzü tamamlayan seçilmiş accesories məhsullarını kəşf edin.",
    buttonText: "Accesories bax",
  },
  {
    category: "Care",
    badge: "Baxım seriyası",
    title: "Care məhsulları",
    subtitle:
      "Dəri və gündəlik qulluq üçün seçilmiş care məhsulları ilə tanış olun.",
    buttonText: "Care bax",
  },
  {
    category: "Makeup",
    badge: "Beauty seçimi",
    title: "Makeup dünyası",
    subtitle:
      "Rəng, parlaqlıq və yeni görünüş üçün makeup məhsullarını rahat şəkildə kəşf edin.",
    buttonText: "Makeup bax",
  },
  {
    category: "Parfume",
    badge: "Xüsusi qoxular",
    title: "Parfume seçimi",
    subtitle:
      "Zərif və yaddaqalan ətirlərdən ibarət parfume kolleksiyasına indi baxın.",
    buttonText: "Parfume bax",
  },
];

const normalizeCategory = (value = "") => {
  const v = value.toString().trim().toLowerCase();

  if (
    [
      "accesories",
      "accessories",
      "accessory",
      "aksesuar",
      "aksesuarlar",
    ].includes(v)
  ) {
    return "Accesories";
  }

  if (
    ["care", "skin care", "skincare", "body care", "hair care"].includes(v)
  ) {
    return "Care";
  }

  if (["makeup", "make up", "kosmetika"].includes(v)) {
    return "Makeup";
  }

  if (["parfume", "perfume", "parfum", "fragrance"].includes(v)) {
    return "Parfume";
  }

  return value;
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Hamısı");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { loadMe } = useAppState();
  const toast = useToast();

  const load = async () => {
    try {
      const r = await api.get("/products");
      setProducts(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      const errorMessage =
        e.response?.data?.message || "Məhsullar yüklənmədi";
      setMsg(errorMessage);
      toast.error("Xəta baş verdi", errorMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setActiveSlide((prev) => {
          if (prev === HERO_SLIDES.length - 1) return 0;
          return prev + 1;
        });

        setTimeout(() => {
          setIsAnimating(false);
        }, 120);
      }, 220);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const favorite = async (id) => {
    setMsg("");

    const wasFavorited = favoriteIds.has(id);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              likeCount: wasFavorited
                ? Math.max(0, (p.likeCount || 0) - 1)
                : (p.likeCount || 0) + 1,
            }
          : p
      )
    );

    try {
      const res = await api.post(`/products/${id}/favorite`);

      const isNowFavorited = Boolean(res.data?.favorited);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isNowFavorited) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });

      setProducts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                likeCount:
                  typeof res.data?.likeCount === "number"
                    ? res.data.likeCount
                    : p.likeCount || 0,
              }
            : p
        )
      );

      await loadMe();
    } catch (e) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });

      setProducts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                likeCount: wasFavorited
                  ? (p.likeCount || 0) + 1
                  : Math.max(0, (p.likeCount || 0) - 1),
              }
            : p
        )
      );

      const errorMessage =
        e.response?.data?.message || "Login lazımdır (favori üçün)";
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

  const filteredProducts = useMemo(() => {
    if (selectedFilter === "Hamısı") return products;

    return products.filter(
      (p) => normalizeCategory(p.category) === selectedFilter
    );
  }, [products, selectedFilter]);

  const currentSlide = HERO_SLIDES[activeSlide];

  const heroPreviewProducts = useMemo(() => {
    if (currentSlide.category === "Hamısı") {
      return products.slice(0, 3);
    }

    return products
      .filter((p) => normalizeCategory(p.category) === currentSlide.category)
      .slice(0, 3);
  }, [products, currentSlide]);

  const handleHeroButtonClick = () => {
    setSelectedFilter(currentSlide.category);
  };

  return (
    <div className="home-page">
      <div className="home-page__container">
        <section className={`home-page__hero ${isAnimating ? "is-switching" : ""}`}>
          <div className="home-page__hero-content">
            <span className="home-page__badge">{currentSlide.badge}</span>

            <h2 className="home-page__title">{currentSlide.title}</h2>

            <p className="home-page__subtitle">{currentSlide.subtitle}</p>

            <div className="home-page__hero-actions">
              <button
                type="button"
                className="home-page__hero-btn"
                onClick={handleHeroButtonClick}
              >
                {currentSlide.buttonText}
              </button>
            </div>

            <div className="home-page__hero-dots">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.category}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`home-page__hero-dot ${
                    activeSlide === index ? "is-active" : ""
                  }`}
                  aria-label={slide.category}
                />
              ))}
            </div>
          </div>

          <div className="home-page__hero-preview">
            {heroPreviewProducts.length > 0 ? (
              heroPreviewProducts.map((p) => (
                <Link
                  key={p._id}
                  to={`/p/${p._id}`}
                  className="home-page__hero-card"
                >
                  <div className="home-page__hero-card-image-wrap">
                    {p.imageUrl ? (
                      <img
                        src={`http://localhost:5000${p.imageUrl}`}
                        alt={p.title}
                        className="home-page__hero-card-image"
                      />
                    ) : (
                      <div className="home-page__hero-card-no-image">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="home-page__hero-card-info">
                    <span className="home-page__hero-card-category">
                      {currentSlide.category}
                    </span>
                    <h3 className="home-page__hero-card-title">{p.title}</h3>
                    <span className="home-page__hero-card-price">
                      {p.price} ₼
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="home-page__hero-empty">
                Bu bölmə üçün məhsul tapılmadı.
              </div>
            )}
          </div>
        </section>

        {msg && <div className="home-page__message">{msg}</div>}

        <div className="home-page__filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`home-page__filter-btn ${
                selectedFilter === filter ? "is-active" : ""
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="home-page__section-head">
          <h3 className="home-page__section-title">
            {selectedFilter === "Hamısı"
              ? "Bütün məhsullar"
              : `${selectedFilter} məhsulları`}
          </h3>

          <span className="home-page__section-count">
            {filteredProducts.length} məhsul
          </span>
        </div>

        <div className="home-page__grid">
          {filteredProducts.map((p) => {
            const isFavorited = favoriteIds.has(p._id);

            return (
              <article key={p._id} className="product-card">
                <Link to={`/p/${p._id}`} className="product-card__image-link">
                  <div className="product-card__image-wrap">
                    {p.imageUrl ? (
                      <img
                        src={`http://localhost:5000${p.imageUrl}`}
                        alt={p.title}
                        className="product-card__image"
                      />
                    ) : (
                      <div className="product-card__no-image">No image</div>
                    )}
                  </div>
                </Link>

                <div className="product-card__body">
                  <div className="product-card__price-row">
                    <Link to={`/p/${p._id}`} className="product-card__title-link">
                      <h3 className="product-card__title">{p.title}</h3>
                    </Link>

                    <span className="product-card__price">{p.price} ₼</span>
                  </div>

                  <div className="product-card__actions">
                    <Link
                      to={`/p/${p._id}`}
                      className="product-card__btn product-card__btn--detail"
                      aria-label="Comment"
                    >
                      <FaRegCommentDots className="product-card__icon" />
                      <span>Comment</span>
                    </Link>

                    <button
                      onClick={() => favorite(p._id)}
                      className={`product-card__btn product-card__btn--like ${
                        isFavorited ? "is-favorited" : ""
                      }`}
                      aria-label="Favorite"
                      type="button"
                    >
                      {isFavorited ? (
                        <FaHeart className="product-card__icon product-card__icon--heart" />
                      ) : (
                        <FaRegHeart className="product-card__icon product-card__icon--heart" />
                      )}
                      <span>{p.likeCount || 0}</span>
                    </button>

                    <button
                      onClick={() => addToCart(p._id)}
                      className="product-card__btn product-card__btn--cart"
                      aria-label="Basket"
                      type="button"
                    >
                      <FaBasketShopping className="product-card__icon" />
                      <span>Səbət</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!filteredProducts.length && !msg && (
          <div className="home-page__empty">
            Bu seçim üzrə hələ məhsul yoxdur.
          </div>
        )}
      </div>
    </div>
  );
}