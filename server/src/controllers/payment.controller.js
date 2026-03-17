import Stripe from "stripe";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { ApiError } from "../utils/apiError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const currency = () => (process.env.STRIPE_CURRENCY || "azn").toLowerCase();

const buildOrderFromUserCart = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.cart.length) throw new ApiError(400, "Cart is empty");

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

  if (!items.length) throw new ApiError(400, "Cart is empty");

  const subtotal = items.reduce((s, x) => s + Number(x.price) * Number(x.qty), 0);
  const shippingFee = 0;
  const tax = 0;
  const total = subtotal + shippingFee + tax;

  return { user, items, subtotal, shippingFee, tax, total };
};

export const fakeCheckout = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body || {};
    const { user, items, subtotal, shippingFee, tax, total } =
      await buildOrderFromUserCart(req.user.id);

    const order = await Order.create({
      user: user._id,
      items,
      subtotal,
      shippingFee,
      tax,
      total,
      currency: "azn",
      customer: { username: user.username, email: user.email },
      shippingAddress: shippingAddress || {},
      status: "paid",
      payment: {
        provider: "demo",
        status: "paid",
        paidAt: new Date(),
        transactionId: `demo_${Date.now()}_${user._id}`,
      },
    });

    user.cart = [];
    await user.save();

    res.json({
      ok: true,
      message: "Demo payment completed",
      order,
    });
  } catch (e) {
    next(e);
  }
};

export const createCartCheckoutSession = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body || {};
    const { user, items, subtotal, shippingFee, tax, total } =
      await buildOrderFromUserCart(req.user.id);

    const order = await Order.create({
      user: user._id,
      items,
      subtotal,
      shippingFee,
      tax,
      total,
      currency: currency(),
      customer: { username: user.username, email: user.email },
      shippingAddress: shippingAddress || {},
      status: "pending",
      payment: { provider: "stripe", status: "pending" },
    });

    const line_items = items.map((i) => ({
      price_data: {
        currency: currency(),
        product_data: {
          name: i.variantLabel ? `${i.title} - ${i.variantLabel}` : i.title || "Product",
        },
        unit_amount: Math.round(Number(i.price) * 100),
      },
      quantity: i.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    });

    order.payment.checkoutSessionId = session.id;
    await order.save();

    res.json({ url: session.url });
  } catch (e) {
    next(e);
  }
};

export const confirmCheckoutSession = async (req, res, next) => {
  try {
    const sessionId = req.body?.sessionId || req.query?.session_id;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    let order = await Order.findOne({ "payment.checkoutSessionId": sessionId });

    if (!order) {
      const orderId = session?.metadata?.orderId || session?.client_reference_id;
      if (orderId) order = await Order.findById(orderId);
    }

    if (!order) return res.status(404).json({ message: "Order not found for this session" });

    if (req.user?.id && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const isPaid = session.payment_status === "paid";
    if (isPaid && order.payment.status !== "paid") {
      order.payment.status = "paid";
      order.status = "paid";
      order.payment.checkoutSessionId = session.id;
      order.payment.paymentIntentId = session.payment_intent?.toString();
      order.payment.paidAt = new Date();
      await order.save();

      const user = await User.findById(order.user);
      if (user) {
        user.cart = [];
        await user.save();
      }
    }

    res.json({ order, stripe: { payment_status: session.payment_status } });
  } catch (e) {
    next(e);
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      let order = await Order.findOne({ "payment.checkoutSessionId": session.id });

      if (!order) {
        const orderId = session?.metadata?.orderId || session?.client_reference_id;
        if (orderId) order = await Order.findById(orderId);
      }

      if (order && order.payment.status !== "paid") {
        order.payment.status = "paid";
        order.status = "paid";
        order.payment.checkoutSessionId = session.id;
        order.payment.paymentIntentId = session.payment_intent?.toString();
        order.payment.paidAt = new Date();
        await order.save();

        const userId = session?.metadata?.userId || order.user.toString();
        const user = await User.findById(userId);
        if (user) {
          user.cart = [];
          await user.save();
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;

      let order = await Order.findOne({ "payment.checkoutSessionId": session.id });

      if (!order) {
        const orderId = session?.metadata?.orderId || session?.client_reference_id;
        if (orderId) order = await Order.findById(orderId);
      }

      if (order && order.payment.status === "pending") {
        order.payment.status = "failed";
        order.status = "canceled";
        await order.save();
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.log("Webhook handler error", err);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};