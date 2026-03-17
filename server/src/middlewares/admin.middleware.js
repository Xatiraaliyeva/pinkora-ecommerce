import User from "../models/User.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select("role");
    if (!u) return res.status(401).json({ message: "Unauthorized" });

    if (u.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (e) {
    next(e);
  }
};