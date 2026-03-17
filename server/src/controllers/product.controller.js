import Product from "../models/Product.js";
import User from "../models/User.js";

const fileToUrl = (file) => `/uploads/${file.filename}`;

const parseVariants = (raw) => {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildProductPayload = (req, existingProduct = null) => {
  const body = req.body || {};
  const files = req.files || {};

  const mainImageFile = files.mainImage?.[0];
  const galleryFiles = files.gallery || [];
  const variantFiles = files.variantImages || [];

  const variantsMeta = parseVariants(body.variants);

  const galleryUrlsFromFiles = galleryFiles.map(fileToUrl);
  const variantUrls = variantFiles.map(fileToUrl);

  const variants = variantsMeta.map((variant, idx) => {
    const preview = variantUrls[idx] || variant.imageUrl || "";

    return {
      colorName: variant.colorName?.trim() || "Default",
      colorHex: variant.colorHex || "",
      sku: variant.sku || "",
      stock: Number(variant.stock || 0),
      price:
        variant.price === "" || variant.price === null || variant.price === undefined
          ? undefined
          : Number(variant.price),
      imageUrl: preview,
      images: preview ? [preview] : [],
      isDefault: Boolean(variant.isDefault),
    };
  });

  const imageUrl =
    mainImageFile
      ? fileToUrl(mainImageFile)
      : existingProduct?.imageUrl || existingProduct?.gallery?.[0] || "";

  const gallery =
    mainImageFile || galleryFiles.length
      ? [
          ...(mainImageFile ? [fileToUrl(mainImageFile)] : []),
          ...galleryUrlsFromFiles,
        ]
      : existingProduct?.gallery || [];

  return {
    title: body.title,
    desc: body.desc || "",
    price: Number(body.price || 0),
    category: body.category || "aksesuar",
    brand: body.brand || "",
    stock: Number(body.stock || 0),
    imageUrl: imageUrl || gallery[0] || "",
    gallery,
    variants,
  };
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (e) {
    next(e);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (e) {
    next(e);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const has = user.favorites.some((x) => x.toString() === productId);
    if (has) {
      user.favorites = user.favorites.filter((x) => x.toString() !== productId);
      product.likeCount = Math.max(0, (product.likeCount || 0) - 1);
    } else {
      user.favorites.push(productId);
      product.likeCount = (product.likeCount || 0) + 1;
    }

    await user.save();
    await product.save();

    res.json({
      ok: true,
      favorited: !has,
      likeCount: product.likeCount,
      favoritesCount: user.favorites.length,
    });
  } catch (e) {
    next(e);
  }
};

export const myFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (e) {
    next(e);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { title, price } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ message: "title və price lazımdır" });
    }

    const payload = buildProductPayload(req);

    const p = await Product.create({
      ...payload,
      likeCount: 0,
    });

    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ message: "Product not found" });

    const payload = buildProductPayload(req, p);

    if (req.body.title !== undefined) p.title = payload.title;
    if (req.body.desc !== undefined) p.desc = payload.desc;
    if (req.body.price !== undefined) p.price = payload.price;
    if (req.body.category !== undefined) p.category = payload.category;
    if (req.body.brand !== undefined) p.brand = payload.brand;
    if (req.body.stock !== undefined) p.stock = payload.stock;

    if ((req.files?.mainImage?.length || 0) > 0 || (req.files?.gallery?.length || 0) > 0) {
      p.imageUrl = payload.imageUrl;
      p.gallery = payload.gallery;
    }

    if (req.body.variants !== undefined) {
      p.variants = payload.variants;
    }

    await p.save();
    res.json(p);
  } catch (e) {
    next(e);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const p = await Product.findByIdAndDelete(id);
    if (!p) return res.status(404).json({ message: "Product not found" });

    await User.updateMany(
      {},
      {
        $pull: {
          favorites: id,
          cart: { product: id },
        },
      }
    );

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};