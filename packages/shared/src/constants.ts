export const USER_ROLES = ["consumer", "vendor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUS = ["active", "suspended", "banned"] as const;
export type UserStatus = (typeof USER_STATUS)[number];

export const VENDOR_STATUS = ["pending", "approved", "rejected", "suspended"] as const;
export type VendorStatus = (typeof VENDOR_STATUS)[number];

export const BOOKING_STATUS = [
  "pending",
  "confirmed",
  "in_preparation",
  "delivered",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const PAYMENT_STATUS = ["unpaid", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const EVENT_TYPES = [
  "birthday",
  "anniversary",
  "corporate",
  "wedding",
  "engagement",
  "family_gathering",
  "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];
