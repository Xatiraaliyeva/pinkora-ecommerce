import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: String,
    price: Number,
    qty: Number,
    imageUrl: String,

    variantId: String,
    variantLabel: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },

    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "azn" },

    customer: {
      username: String,
      email: String,
    },

    shippingAddress: {
      fullName: String,
      phone: String,
      city: String,
      address1: String,
      address2: String,
      postalCode: String,
      notes: String,
    },

    payment: {
      provider: {
        type: String,
        enum: ["stripe", "demo", "cash"],
        default: "demo",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      checkoutSessionId: String,
      paymentIntentId: String,
      transactionId: String,
      paidAt: Date,
    },

    shipping: {
      carrier: String,
      trackingNumber: String,
      shippedAt: Date,
      deliveredAt: Date,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "canceled", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);