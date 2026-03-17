import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import { useToast } from "../../context/ToastContext";
import "./AdminProducts.css";

const emptyVariant = {
  colorName: "",
  colorHex: "",
  sku: "",
  stock: 0,
  price: "",
  isDefault: false,
  file: null,
};

const PRODUCT_FILTERS = [
  "Hamısı",
  "Accesories",
  "Care",
  "Makeup",
  "Parfume",
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

export default function AdminProducts() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("aksesuar");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("0");

  const [mainImage, setMainImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);

  const [msg, setMsg] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Hamısı");
  const [visibleCount, setVisibleCount] = useState(3);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    title: "",
  });

  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const r = await api.get("/admin/panel/products");
      setItems(r.data.items || []);
    } catch (e) {
      const errorMessage =
        e.response?.data?.message || "Məhsullar yüklənmədi.";
      setMsg(errorMessage);
      toast.error("Xəta baş verdi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const addVariantRow = () => {
    setVariants((prev) => [...prev, { ...emptyVariant }]);
  };

  const updateVariant = (index, key, value) => {
    setVariants((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setPrice("");
    setCategory("aksesuar");
    setBrand("");
    setStock("0");
    setMainImage(null);
    setGallery([]);
    setVariants([{ ...emptyVariant }]);
  };

  const create = async () => {
    setMsg("");

    try {
      setCreateLoading(true);

      const fd = new FormData();
      fd.append("title", title);
      fd.append("desc", desc);
      fd.append("price", price);
      fd.append("category", category);
      fd.append("brand", brand);
      fd.append("stock", stock);

      if (mainImage) fd.append("mainImage", mainImage);
      for (const file of gallery) fd.append("gallery", file);

      const variantPayload = variants
        .filter((v) => v.colorName.trim())
        .map(({ file, ...rest }) => rest);

      fd.append("variants", JSON.stringify(variantPayload));

      variants
        .filter((v) => v.colorName.trim())
        .forEach((v) => {
          if (v.file) fd.append("variantImages", v.file);
        });

      const r = await api.post("/admin/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const successText = "Məhsul uğurla əlavə olundu ✅";
      setMsg(successText + " " + (r.data?.title || ""));
      toast.success(
        "Uğurlu əməliyyat",
        `"${r.data?.title || title}" məhsulu əlavə edildi.`
      );

      resetForm();
      await load();
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message;
      setMsg(errorMessage);
      toast.error("Xəta baş verdi", errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const openDeleteModal = (product) => {
    setDeleteModal({
      open: true,
      id: product._id,
      title: product.title || "Məhsul",
    });
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteModal({
      open: false,
      id: null,
      title: "",
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/admin/panel/products/${deleteModal.id}`);
      toast.success("Uğurlu əməliyyat", "Məhsul uğurla silindi.");
      await load();
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Məhsul silinmədi.";
      toast.error("Xəta baş verdi", errorMessage);
    } finally {
      setDeleteLoading(false);
      setDeleteModal({
        open: false,
        id: null,
        title: "",
      });
    }
  };

  const filteredItems = useMemo(() => {
    if (selectedFilter === "Hamısı") return items;

    return items.filter(
      (item) => normalizeCategory(item.category) === selectedFilter
    );
  }, [items, selectedFilter]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = filteredItems.length > visibleCount;

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setVisibleCount(3);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="admin-products">
      <div className="admin-products__top">
        <div className="admin-products__heading">
          <h2 className="admin-products__title">Məhsullar ✨</h2>
          <p className="admin-products__subtitle">
            Yeni məhsul əlavə edin, variantları idarə edin və mövcud məhsulları
            daha rahat şəkildə buradan izləyin.
          </p>
        </div>

        <div className="admin-products__stats">
          <div className="admin-products__stat-card">
            <span className="admin-products__stat-label">Toplam məhsul</span>
            <strong className="admin-products__stat-value">{items.length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-products__layout">
        <section className="admin-products__form-panel">
          <div className="admin-section-header">
            <h3 className="admin-section-header__title">Yeni məhsul əlavə et 🛍️</h3>
            <p className="admin-section-header__text">
              Aşağıdakı məlumatları dolduraraq yeni məhsulu sistemə əlavə edin.
            </p>
          </div>

          <div className="admin-products__form">
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label className="admin-form-label">Məhsul adı</label>
                <input
                  className="admin-form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Məsələn: Dəri çanta"
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Brend</label>
                <input
                  className="admin-form-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Məsələn: Zara"
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Kateqoriya</label>
                <input
                  className="admin-form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Məsələn: Accesories"
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Baza qiymət</label>
                <input
                  className="admin-form-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Məsələn: 49.90"
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Stok sayı</label>
                <input
                  className="admin-form-input"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Məsələn: 15"
                />
              </div>

              <div className="admin-form-field admin-form-field--full">
                <label className="admin-form-label">Məhsul haqqında qısa məlumat</label>
                <textarea
                  className="admin-form-textarea"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Məhsulun xüsusiyyətlərini, materialını və digər vacib detalları yazın..."
                  rows={4}
                />
              </div>

              <div className="admin-form-upload">
                <label className="admin-form-label">Əsas şəkil 📌</label>
                <input
                  className="admin-form-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMainImage(e.target.files?.[0] || null)}
                />
                <span className="admin-form-help">
                  Məhsulun əsas görünüşünü göstərən şəkli seçin.
                </span>
              </div>

              <div className="admin-form-upload">
                <label className="admin-form-label">Qalereya şəkilləri 🖼️</label>
                <input
                  className="admin-form-file"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setGallery(Array.from(e.target.files || []))}
                />
                <span className="admin-form-help">
                  Bir neçə əlavə şəkil seçərək məhsulu daha ətraflı göstərə bilərsiniz.
                </span>
              </div>
            </div>

            <div className="admin-variants">
              <div className="admin-section-header admin-section-header--variants">
                <h3 className="admin-section-header__title">Rəng variantları 🎨</h3>
                <p className="admin-section-header__text">
                  Məhsul üçün fərqli rəng, stok və qiymət seçimləri əlavə edin.
                </p>
              </div>

              <div className="admin-variants__list">
                {variants.map((v, index) => (
                  <div key={index} className="variant-card">
                    <div className="variant-card__head">
                      <h4 className="variant-card__title">Variant #{index + 1}</h4>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="variant-card__remove-btn"
                          onClick={() => removeVariant(index)}
                        >
                          Sil
                        </button>
                      )}
                    </div>

                    <div className="variant-card__grid">
                      <div className="admin-form-field">
                        <label className="admin-form-label">Rəng adı</label>
                        <input
                          className="admin-form-input"
                          placeholder="Məsələn: Qara"
                          value={v.colorName}
                          onChange={(e) =>
                            updateVariant(index, "colorName", e.target.value)
                          }
                        />
                      </div>

                      <div className="admin-form-field">
                        <label className="admin-form-label">Hex kod</label>
                        <input
                          className="admin-form-input"
                          placeholder="Məsələn: #000000"
                          value={v.colorHex}
                          onChange={(e) =>
                            updateVariant(index, "colorHex", e.target.value)
                          }
                        />
                      </div>

                      <div className="admin-form-field">
                        <label className="admin-form-label">SKU kodu</label>
                        <input
                          className="admin-form-input"
                          placeholder="Məsələn: SKU-001"
                          value={v.sku}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                        />
                      </div>

                      <div className="admin-form-field">
                        <label className="admin-form-label">Stok sayı</label>
                        <input
                          className="admin-form-input"
                          placeholder="Məsələn: 8"
                          value={v.stock}
                          onChange={(e) =>
                            updateVariant(index, "stock", e.target.value)
                          }
                        />
                      </div>

                      <div className="admin-form-field">
                        <label className="admin-form-label">Variant qiyməti</label>
                        <input
                          className="admin-form-input"
                          placeholder="Boş qala bilər"
                          value={v.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                        />
                      </div>

                      <div className="admin-form-upload">
                        <label className="admin-form-label">Variant şəkli</label>
                        <input
                          className="admin-form-file"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            updateVariant(index, "file", e.target.files?.[0] || null)
                          }
                        />
                      </div>

                      <label className="variant-card__checkbox">
                        <input
                          type="checkbox"
                          checked={v.isDefault}
                          onChange={(e) =>
                            updateVariant(index, "isDefault", e.target.checked)
                          }
                        />
                        <span>Bu variant əsas seçim olsun</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="admin-secondary-btn"
                onClick={addVariantRow}
              >
                + Yeni variant əlavə et
              </button>
            </div>

            <div className="admin-products__actions">
              <button
                type="button"
                className="admin-primary-btn"
                onClick={create}
                disabled={createLoading}
              >
                {createLoading ? "Əlavə olunur..." : "Məhsulu yarat"}
              </button>
            </div>

            {msg && <div className="admin-products__message">{msg}</div>}
          </div>
        </section>

        <section className="admin-products__list-panel">
          <div className="admin-section-header">
            <h3 className="admin-section-header__title">Əlavə olunan məhsullar 📦</h3>
            <p className="admin-section-header__text">
              Məhsulları kateqoriyaya görə süzün, əvvəlcə sadəcə 3 məhsula baxın,
              sonra lazım olduqda digərlərini açın.
            </p>
          </div>

          <div className="admin-products__filter-row">
            {PRODUCT_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterChange(filter)}
                className={`admin-products__filter-btn ${
                  selectedFilter === filter ? "is-active" : ""
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="admin-products__state">Məhsullar yüklənir...</div>
          ) : filteredItems.length ? (
            <>
              <div className="product-list">
                {visibleItems.map((p) => (
                  <article key={p._id} className="product-item">
                    <div className="product-item__top">
                      <div className="product-item__info">
                        <div className="product-item__top-row">
                          <h4 className="product-item__title">{p.title}</h4>
                          <span className="product-item__category">
                            {normalizeCategory(p.category || "Hamısı")}
                          </span>
                        </div>

                        <div className="product-item__meta">
                          <span>{p.price} ₼</span>
                          <span>Variant sayı: {p.variants?.length || 0}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="product-item__delete-btn"
                        onClick={() => openDeleteModal(p)}
                      >
                        Sil
                      </button>
                    </div>

                    {p.desc && <p className="product-item__desc">{p.desc}</p>}

                    {!!p.gallery?.length && (
                      <div className="product-item__gallery">
                        {p.gallery.map((img, idx) => (
                          <img
                            key={idx}
                            src={`http://localhost:5000${img}`}
                            alt={`${p.title} ${idx + 1}`}
                            className="product-item__gallery-image"
                          />
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {hasMore && (
                <div className="admin-products__more-wrap">
                  <button
                    type="button"
                    className="admin-products__more-btn"
                    onClick={handleShowMore}
                  >
                    Daha çox göstər
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="admin-products__state">
              Bu kateqoriya üzrə hələ məhsul yoxdur.
            </div>
          )}
        </section>
      </div>

      {deleteModal.open && (
        <div className="admin-modal-overlay" onClick={closeDeleteModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__icon">!</div>

            <h3 className="admin-modal__title">Məhsulu silmək istəyirsiniz?</h3>

            <p className="admin-modal__text">
              <strong>{deleteModal.title}</strong> adlı məhsul sistemdən silinəcək.
              Bu əməliyyat geri qaytarılmaya bilər.
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