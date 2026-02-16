import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

export const bookingsRouter = Router();
bookingsRouter.use(authMiddleware);

const createBookingSchema = z.object({
  eventId: z.string().uuid(),
  vendorId: z.string().uuid(),
  packageId: z.string().uuid(),
  guestCount: z.number().int().positive(),
  specialRequirements: z.string().optional(),
});

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GH-${year}-${random}`;
}

bookingsRouter.post("/", async (req, res) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const userId = req.user!.userId;
  const { eventId, vendorId, packageId, guestCount, specialRequirements } = parsed.data;

  const [event, vendor, pkg] = await Promise.all([
    prisma.event.findFirst({ where: { id: eventId, userId } }),
    prisma.vendor.findFirst({ where: { id: vendorId, status: "approved" } }),
    prisma.package.findFirst({ where: { id: packageId, vendorId, isActive: true } }),
  ]);

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }
  if (!vendor) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  if (!pkg) {
    return res.status(404).json({ error: "Package not found" });
  }
  if (vendor.businessType !== "catering") {
    return res.status(400).json({ error: "Vendor does not offer catering" });
  }

  if (pkg.minGuests != null && guestCount < pkg.minGuests) {
    return res.status(400).json({ error: `Minimum ${pkg.minGuests} guests required for this package` });
  }
  if (pkg.maxGuests != null && guestCount > pkg.maxGuests) {
    return res.status(400).json({ error: `Maximum ${pkg.maxGuests} guests for this package` });
  }

  const basePrice = Number(pkg.basePrice);
  const setupFee = Number(pkg.setupFee ?? 0);
  const serviceChargePercent = Number(pkg.serviceChargePercent ?? 0);

  const subtotal =
    pkg.priceType === "per_person" ? basePrice * guestCount : basePrice;
  const serviceCharges = (subtotal * serviceChargePercent) / 100;
  const totalAmount = subtotal + serviceCharges + setupFee;

  let bookingReference = generateBookingReference();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.booking.findUnique({
      where: { bookingReference },
    });
    if (!existing) break;
    bookingReference = generateBookingReference();
    attempts++;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  const consumerName = user?.name || "A customer";

  const booking = await prisma.booking.create({
    data: {
      bookingReference,
      userId,
      vendorId,
      eventId,
      packageId,
      guestCount,
      subtotal,
      serviceCharges,
      totalAmount,
      specialRequirements: specialRequirements?.trim() || null,
      status: "pending",
    },
    include: {
      vendor: { select: { businessName: true, logoUrl: true, userId: true } },
      event: { select: { name: true, date: true } },
      package: { select: { name: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: booking.vendor.userId,
      type: "new_booking",
      title: "New booking request",
      message: `${consumerName} requested ${pkg.name} for ${event.name}`,
      link: `/bookings/${booking.id}`,
      metadata: { targetApp: "vendor" },
    },
  });

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { totalBookings: { increment: 1 } },
  });

  res.status(201).json(booking);
});

bookingsRouter.get("/", async (req, res) => {
  const userId = req.user!.userId;
  const { status } = req.query;

  const where: { userId: string; status?: string | { in: string[] } } = { userId };
  if (typeof status === "string" && status) {
    const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      where.status = statuses[0];
    } else if (statuses.length > 1) {
      where.status = { in: statuses };
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { businessName: true, logoUrl: true } },
      event: { select: { name: true, date: true } },
      package: { select: { name: true, imageUrl: true } },
      reviews: { select: { id: true } },
    },
  });

  res.json(bookings);
});

// GET /api/bookings/:id - consumer booking detail
bookingsRouter.get("/:id", async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
    include: {
      vendor: { select: { id: true, businessName: true, logoUrl: true } },
      event: {
        select: {
          id: true,
          name: true,
          date: true,
          timeStart: true,
          timeEnd: true,
          guestCount: true,
          location: true,
          venueType: true,
          venueName: true,
          specialRequirements: true,
        },
      },
      package: {
        include: {
          packageItems: { orderBy: { displayOrder: "asc" }, select: { name: true, description: true, category: true } },
        },
      },
      reviews: { select: { id: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  res.json(booking);
});

// PATCH /api/bookings/:id/pay - dummy payment (consumer only)
bookingsRouter.patch("/:id/pay", async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const paymentMethodId = req.body?.paymentMethodId as string | undefined;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.status !== "confirmed") {
    return res.status(400).json({ error: "Only confirmed bookings can be paid" });
  }
  if (booking.paymentStatus === "paid") {
    return res.status(400).json({ error: "Booking is already paid" });
  }

  let paymentMethodLabel = "card";
  if (paymentMethodId) {
    const pm = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });
    if (pm) paymentMethodLabel = `${pm.brand} •••• ${pm.last4}`;
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { paymentStatus: "paid", paymentMethod: paymentMethodLabel },
    include: {
      user: { select: { name: true } },
      vendor: { select: { businessName: true, logoUrl: true, userId: true } },
      event: { select: { name: true, date: true } },
      package: { select: { name: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: updated.vendor.userId,
      type: "payment_received",
      title: "Payment received",
      message: `${updated.user.name} paid for ${updated.event.name}`,
      link: `/bookings/${updated.id}`,
      metadata: { bookingId: updated.id, targetApp: "vendor" },
    },
  });

  res.json(updated);
});

const createReviewSchema = z.object({
  ratingOverall: z.number().int().min(1).max(5),
  reviewText: z.string().max(2000).optional(),
  ratingFood: z.number().int().min(1).max(5).optional(),
  ratingService: z.number().int().min(1).max(5).optional(),
  ratingValue: z.number().int().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
});

// POST /api/bookings/:id/review - create review for completed booking
bookingsRouter.post("/:id/review", async (req, res) => {
  const userId = req.user!.userId;
  const { id: bookingId } = req.params;

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.status !== "completed" && booking.status !== "delivered") {
    return res.status(400).json({ error: "Only delivered or completed bookings can be reviewed" });
  }

  const existing = await prisma.review.findUnique({
    where: { bookingId },
  });
  if (existing) {
    return res.status(400).json({ error: "You have already reviewed this booking" });
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      vendorId: booking.vendorId,
      userId,
      ratingOverall: parsed.data.ratingOverall,
      reviewText: parsed.data.reviewText ?? null,
      ratingFood: parsed.data.ratingFood ?? null,
      ratingService: parsed.data.ratingService ?? null,
      ratingValue: parsed.data.ratingValue ?? null,
      wouldRecommend: parsed.data.wouldRecommend ?? null,
    },
  });

  const vendorReviews = await prisma.review.findMany({
    where: { vendorId: booking.vendorId },
    select: { ratingOverall: true },
  });
  const avg =
    vendorReviews.reduce((s, r) => s + r.ratingOverall, 0) / vendorReviews.length;

  await prisma.vendor.update({
    where: { id: booking.vendorId },
    data: { ratingAvg: avg, ratingCount: vendorReviews.length },
  });

  res.status(201).json(review);
});
