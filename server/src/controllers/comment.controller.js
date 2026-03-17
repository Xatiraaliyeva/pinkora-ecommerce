import Comment from "../models/Comment.js";

export const listComments = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ product: productId })
      .populate("user", "username")
      .sort({ createdAt: 1 })
      .lean();

    const map = new Map();
    comments.forEach((c) => (map.set(c._id.toString(), { ...c, replies: [], likeCount: (c.likedBy || []).length })));

    const roots = [];
    map.forEach((c) => {
      if (c.parent) {
        const p = map.get(String(c.parent));
        if (p) p.replies.push(c);
        else roots.push(c);
      } else {
        roots.push(c);
      }
    });

    res.json(roots);
  } catch (e) {
    next(e);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { text, parent } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });

    const c = await Comment.create({
      product: productId,
      user: req.user.id,
      text,
      parent: parent || null,
      likedBy: [],
    });

    const populated = await Comment.findById(c._id).populate("user", "username").lean();
    res.status(201).json({ ...populated, replies: [], likeCount: 0 });
  } catch (e) {
    next(e);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const c = await Comment.findById(id);
    if (!c) return res.status(404).json({ message: "Not found" });

    if (c.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can delete only your comment" });
    }

    await Comment.deleteMany({ $or: [{ _id: id }, { parent: id }] });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const toggleLikeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const c = await Comment.findById(id);
    if (!c) return res.status(404).json({ message: "Not found" });

    const userId = req.user.id;
    const has = (c.likedBy || []).some((u) => u.toString() === userId);

    if (has) c.likedBy = c.likedBy.filter((u) => u.toString() !== userId);
    else c.likedBy.push(userId);

    await c.save();
    res.json({ ok: true, liked: !has, likeCount: c.likedBy.length });
  } catch (e) {
    next(e);
  }
};