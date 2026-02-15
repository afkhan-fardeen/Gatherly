import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // Fallback: cwd .env (e.g. packages/api/.env)

import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { bookingsRouter } from "./routes/bookings.js";
import { paymentMethodsRouter } from "./routes/payment-methods.js";
import { eventsRouter } from "./routes/events.js";
import { healthRouter } from "./routes/health.js";
import { notificationsRouter } from "./routes/notifications.js";
import { uploadRouter } from "./routes/upload.js";
import { vendorRouter } from "./routes/vendor.js";
import { vendorsRouter } from "./routes/vendors.js";

const app = express();
const PORT = process.env.API_PORT || 3001;

const corsOrigins = [
  process.env.CONSUMER_URL || "http://localhost:3000",
  process.env.VENDOR_URL || "http://localhost:3002",
  process.env.ADMIN_URL || "http://localhost:3003",
  process.env.CONSUMER_URL_MOBILE,
].filter((x): x is string => Boolean(x));

// In development, allow all origins for mobile testing (avoids CORS issues)
const corsOptions =
  process.env.NODE_ENV !== "production"
    ? { origin: true, credentials: true }
    : { origin: corsOrigins, credentials: true };

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/events", eventsRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payment-methods", paymentMethodsRouter);
app.use("/api/notifications", notificationsRouter);

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`API running at http://localhost:${PORT}`);
});
