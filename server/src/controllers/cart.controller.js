import User from "../models/User.js";
import Product from "../models/Product.js";

const getVariant = (product, variantId) => {
  if (!variantId) return null;
  return product.variants?.find((v) => v._id.toString() === variantId) || null;
};

const calcCart = async (user) => {
  const ids = user.cart.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } }).lean();

  const map = new Map(products.map((p) => [p._id.toString(), p]));

  const items = user.cart
    .map((i) => {
      const p = map.get(i.product.toString());
      if (!p) return null;

      const variant = getVariant(p, i.variantId);
      const price = Number(variant?.price ?? p.price ?? 0);
      const imageUrl =
        variant?.imageUrl ||
        variant?.images?.[0] ||
        p.imageUrl ||
        p.gallery?.[0] ||
        "";

      const variantLabel = variant?.colorName || i.variantLabel || "";

      return {
        productId: p._id,
        title: p.title,
        price,
        imageUrl,
        qty: i.qty,
        lineTotal: price * i.qty,
        variantId: i.variantId || "",
        variantLabel,
      };
    })
    .filter(Boolean);

  const total = items.reduce((s, x) => s + x.lineTotal, 0);
  const count = items.reduce((s, x) => s + x.qty, 0);
  return { items, total, count };
};

export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(await calcCart(user));
  } catch (e) {
    next(e);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty, variantId = "" } = req.body;
    const q = Math.max(1, Number(qty || 1));

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let variant = null;
    if (variantId) {
      variant = product.variants?.find((v) => v._id.toString() === variantId);
      if (!variant) return res.status(400).json({ message: "Variant not found" });
    }

    const user = await User.findById(req.user.id);

    const found = user.cart.find(
      (i) =>
        i.product.toString() === productId &&
        (i.variantId || "") === (variantId || "")
    );

    if (found) {
      found.qty += q;
    } else {
      user.cart.push({
        product: productId,
        qty: q,
        variantId: variantId || "",
        variantLabel: variant?.colorName || "",
      });
    }

    await user.save();
    res.json(await calcCart(user));
  } catch (e) {
    next(e);
  }
};

export const setQty = async (req, res, next) => {
  try {
    const { productId, qty, variantId = "" } = req.body;
    const q = Number(qty);

    const user = await User.findById(req.user.id);
    const item = user.cart.find(
      (i) =>
        i.product.toString() === productId &&
        (i.variantId || "") === (variantId || "")
    );

    if (!item) return res.status(404).json({ message: "Not in cart" });

    if (q <= 0) {
      user.cart = user.cart.filter(
        (i) =>
          !(
            i.product.toString() === productId &&
            (i.variantId || "") === (variantId || "")
          )
      );
    } else {
      item.qty = q;
    }

    await user.save();
    res.json(await calcCart(user));
  } catch (e) {
    next(e);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variantId = req.query.variantId || "";

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      (i) =>
        !(
          i.product.toString() === productId &&
          (i.variantId || "") === variantId
        )
    );

    await user.save();
    res.json(await calcCart(user));
  } catch (e) {
    next(e);
  }
};