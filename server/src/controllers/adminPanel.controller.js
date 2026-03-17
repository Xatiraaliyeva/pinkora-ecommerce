import User from "../models/User.js";
import Product from "../models/Product.js";
import Comment from "../models/Comment.js";
import Order from "../models/Order.js";

const SUPER_ADMIN_EMAIL = "xatiree81@gmail.com";

// PRODUCTS
export const adminListProducts = async (req, res, next) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

export const adminDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

// COMMENTS
export const adminListComments = async (req, res, next) => {
  try {
    const items = await Comment.find()
      .sort({ createdAt: -1 })
      .populate("user", "username email")
      .populate("product", "title");
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

export const adminDeleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Comment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Comment not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

// USERS
export const adminListUsers = async (req, res, next) => {
  try {
    const items = await User.find()
      .select("_id username email role createdAt")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (e) {
    next(e);
  }
};

export const adminUpdateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Valid role is required" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // əsas admin qorunsun
    if (targetUser.email === SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ message: "Main admin role cannot be changed" });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      ok: true,
      user: {
        _id: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        createdAt: targetUser.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // əsas admin qorunsun
    if (user.email === SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ message: "Main admin cannot be deleted" });
    }

    await User.findByIdAndDelete(id);

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

// ORDERS
export const adminListOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status) q.status = status;

    const items = await Order.find(q)
      .sort({ createdAt: -1 })
      .populate("user", "username email")
      .lean();

    res.json({ items });
  } catch (e) {
    next(e);
  }
};

export const adminUpdateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingNumber } = req.body || {};

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.shipping = order.shipping || {};

    if (status) {
      order.status = status;

      if (status === "shipped" && !order.shipping.shippedAt) {
        order.shipping.shippedAt = new Date();
      }

      if (status === "delivered" && !order.shipping.deliveredAt) {
        order.shipping.deliveredAt = new Date();
      }
    }

    if (carrier !== undefined) order.shipping.carrier = carrier;
    if (trackingNumber !== undefined) order.shipping.trackingNumber = trackingNumber;

    await order.save();
    res.json({ ok: true, order });
  } catch (e) {
    next(e);
  }
};