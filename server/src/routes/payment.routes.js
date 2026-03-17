import express from "express";
import Stripe from "stripe";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createCartCheckoutSession,
  confirmCheckoutSession,
  fakeCheckout,
} from "../controllers/payment.controller.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-cart-checkout-session", requireAuth, createCartCheckoutSession);
router.post("/fake-checkout", requireAuth, fakeCheckout);
router.post("/confirm", requireAuth, confirmCheckoutSession);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { product } = req.body;

    const title = (product?.name || product?.title || "Product").toString();
    const priceNumber = Number(String(product?.price ?? "").replace(",", "."));

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return res.status(400).json({ message: "Price is invalid" });
    }

    const unitAmount = Math.round(priceNumber * 100);
    const currency = (process.env.STRIPE_CURRENCY || "azn").toLowerCase();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: title },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.log("Stripe error:", error);
    return res.status(500).json({
      message: "Stripe error",
      detail: error?.message,
    });
  }
});

export default router;