import User from "../models/User.js";
import Token from "../models/Token.js";
import Otp from "../models/Otp.js";

import { ApiError } from "../utils/apiError.js";
import { hashValue, compareValue } from "../utils/hash.js";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookies.js";
import { generateOtp } from "../utils/otp.js";
import { sendMail } from "../utils/mailer.js";

const REFRESH_DAYS = 7;

// ✅ BURANI DƏQİQ ET: xatiree81 mailin necədirsə elə yaz
const ADMIN_EMAIL = "xatiree81@gmail.com";

const isBootstrapAdmin = (email) =>
  String(email || "").toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

const hashToken = async (t) => hashValue(t);

// ✅ createSession export qalır (səndə artıq belədir)
export const createSession = async (res, user) => {
  const payload = { id: user._id.toString(), role: user.role };

  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  const tokenHash = await hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await Token.create({ user: user._id, tokenHash, expiresAt });

  setRefreshCookie(res, refreshToken);

  return {
    accessToken,
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
  };
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) throw new ApiError(400, "Missing fields");

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) throw new ApiError(409, "User already exists");

    const passwordHash = await hashValue(password);

    // ✅ FIX: xatiree81 maili register olanda admin role alsın
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      role: isBootstrapAdmin(email) ? "admin" : "user",
    });

    const data = await createSession(res, user);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) throw new ApiError(400, "Missing fields");

    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    if (!user) throw new ApiError(401, "Invalid credentials");

    const ok = await compareValue(password, user.passwordHash);
    if (!ok) throw new ApiError(401, "Invalid credentials");

    // ✅ FIX: user əvvəldən "user" olsa belə, xatiree81 mailidirsə admin-ə qaldır
    if (isBootstrapAdmin(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const data = await createSession(res, user);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email required");

    const normalized = email.toLowerCase();

    const user = await User.findOne({ email: normalized });
    if (!user) throw new ApiError(404, "User not found");

    const code = generateOtp();
    const codeHash = await hashValue(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 dəq

    await Otp.create({ email: normalized, codeHash, expiresAt });

    await sendMail({
      to: normalized,
      subject: "Your OTP code",
      html: `<p>OTP kodun: <b>${code}</b></p><p>5 dəqiqəyə bitir.</p>`,
    });

    res.json({ ok: true, message: "OTP sent" });
  } catch (e) {
    next(e);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) throw new ApiError(400, "Missing fields");

    const normalized = email.toLowerCase();

    const otp = await Otp.findOne({ email: normalized, usedAt: null }).sort({ createdAt: -1 });
    if (!otp) throw new ApiError(400, "OTP not found");
    if (otp.expiresAt.getTime() < Date.now()) throw new ApiError(400, "OTP expired");

    const ok = await compareValue(String(code), otp.codeHash);
    if (!ok) throw new ApiError(400, "Invalid OTP");

    otp.usedAt = new Date();
    await otp.save();

    const user = await User.findOne({ email: normalized });
    if (!user) throw new ApiError(404, "User not found");

    // ✅ burada da problem yoxdur: user admin olduysa createSession role=admin yazacaq
    const data = await createSession(res, user);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new ApiError(401, "No refresh token");

    let payload;
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }

    const sessions = await Token.find({ user: payload.id, revokedAt: null });
    if (!sessions.length) throw new ApiError(401, "Session not found");

    let matched = null;
    for (const s of sessions) {
      const ok = await compareValue(refreshToken, s.tokenHash);
      if (ok) {
        matched = s;
        break;
      }
    }
    if (!matched) throw new ApiError(401, "Session invalid");
    if (matched.expiresAt.getTime() < Date.now()) throw new ApiError(401, "Session expired");

    const user = await User.findById(payload.id);
    if (!user) throw new ApiError(404, "User not found");

    // ✅ refresh zamanı da admin mailidirsə admin-ə qaldır (təhlükəsiz)
    if (isBootstrapAdmin(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    matched.revokedAt = new Date();
    await matched.save();

    const data = await createSession(res, user);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const sessions = await Token.find({ revokedAt: null });
      for (const s of sessions) {
        const ok = await compareValue(refreshToken, s.tokenHash);
        if (ok) {
          s.revokedAt = new Date();
          await s.save();
          break;
        }
      }
    }

    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

// forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email required");

    const normalized = email.toLowerCase();
    const user = await User.findOne({ email: normalized });
    if (!user) throw new ApiError(404, "User not found");

    const code = generateOtp();
    const codeHash = await hashValue(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dəq

    await Otp.create({ email: normalized, codeHash, expiresAt });

    await sendMail({
      to: normalized,
      subject: "Reset password code",
      html: `<p>Şifrə bərpa kodun: <b>${code}</b></p><p>10 dəqiqəyə bitir.</p>`,
    });

    res.json({ ok: true, message: "Reset code sent" });
  } catch (e) {
    next(e);
  }
};

// reset password (email + otp + newPassword)
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) throw new ApiError(400, "Missing fields");

    const normalized = email.toLowerCase();

    const otp = await Otp.findOne({ email: normalized, usedAt: null }).sort({ createdAt: -1 });
    if (!otp) throw new ApiError(400, "Code not found");
    if (otp.expiresAt.getTime() < Date.now()) throw new ApiError(400, "Code expired");

    const ok = await compareValue(String(code), otp.codeHash);
    if (!ok) throw new ApiError(400, "Invalid code");

    otp.usedAt = new Date();
    await otp.save();

    const user = await User.findOne({ email: normalized });
    if (!user) throw new ApiError(404, "User not found");

    user.passwordHash = await hashValue(newPassword);
    await user.save();

    await Token.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });

    clearRefreshCookie(res);

    res.json({ ok: true, message: "Password updated" });
  } catch (e) {
    next(e);
  }
};