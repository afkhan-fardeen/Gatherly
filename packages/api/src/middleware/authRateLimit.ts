import rateLimit from "express-rate-limit";

const windowLogin = Number(process.env.LOGIN_RATE_WINDOW_MS) || 15 * 60 * 1000;
const maxLogin = Number(process.env.LOGIN_RATE_MAX) || 5;
const windowRegister = Number(process.env.REGISTER_RATE_WINDOW_MS) || 60 * 60 * 1000;
const maxRegister = Number(process.env.REGISTER_RATE_MAX) || 3;

/** Stricter limit for POST /api/auth/login */
export const loginRateLimiter = rateLimit({
  windowMs: windowLogin,
  max: maxLogin,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." },
});

/** Stricter limit for POST /api/auth/register */
export const registerRateLimiter = rateLimit({
  windowMs: windowRegister,
  max: maxRegister,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts. Try again later." },
});
