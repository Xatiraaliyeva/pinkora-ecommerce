import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES || "15m",
    jwtid: crypto.randomUUID(), 
  });

export const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES || "7d",
    jwtid: crypto.randomUUID(), 
  });

export const verifyAccess = (t) => jwt.verify(t, process.env.JWT_ACCESS_SECRET);
export const verifyRefresh = (t) => jwt.verify(t, process.env.JWT_REFRESH_SECRET);