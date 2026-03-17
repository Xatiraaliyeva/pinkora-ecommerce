import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const buildItemsFromCart = async (user) => {
  const ids = user.cart.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  const items = user.cart
    .map((i) => {
      const p = map.get(i.product.toString());
      if (!p) return null;

      const variant =
        p.variants?.find((v) => v._id.toString() === (i.variantId || "")) || null;

      const price = Number(variant?.price ?? p.price ?? 0);
      const imageUrl =
        variant?.imageUrl ||
        variant?.images?.[0] ||
        p.imageUrl ||
        p.gallery?.[0] ||
        "";

      return {
        product: p._id,
        title: p.title,
        price,
        qty: i.qty,
        imageUrl,
        variantId: i.variantId || "",
        variantLabel: variant?.colorName || i.variantLabel || "",
      };
    })
    .filter(Boolean);

  return items;
};

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = "cash" } = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user.cart.length) return res.status(400).json({ message: "Cart is empty" });

    const items = await buildItemsFromCart(user);
    const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
    const total = subtotal;

    const paymentProvider = paymentMethod === "cash" ? "cash" : "demo";
    const paymentStatus = paymentMethod === "cash" ? "pending" : "paid";
    const orderStatus = paymentMethod === "cash" ? "pending" : "paid";

    const order = await Order.create({
      user: user._id,
      items,
      subtotal,
      total,
      currency: "azn",
      customer: { username: user.username, email: user.email },
      shippingAddress: shippingAddress || {},
      status: orderStatus,
      payment: {
        provider: paymentProvider,
        status: paymentStatus,
        paidAt: paymentStatus === "paid" ? new Date() : null,
        transactionId:
          paymentProvider === "demo" ? `demo_${Date.now()}_${user._id}` : "",
      },
    });

    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    next(e);
  }
};