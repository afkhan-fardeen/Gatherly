import { Router, Request, Response } from "express";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { logAdminAction } from "../lib/adminAudit.js";

export const adminRouter = Router();
adminRouter.use(authMiddleware);
adminRouter.use(adminAuth);

function vendorNetFromBooking(b: { totalAmount: Decimal; serviceCharges: Decimal }): Decimal {
  return b.totalAmount.minus(b.serviceCharges);
}

const refundBodySchema = z.object({
  reason: z.string().min(1).max(2000),
});

const payoutBatchSchema = z.object({
  bookingIds: z.array(z.string().uuid()).min(1),
  notes: z.string().max(2000).optional(),
});

const markPaidSchema = z.object({
  reference: z.string().max(500).optional(),
});

const vendorStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]),
});

const userStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

const adminStatusOverrideSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "in_preparation",
    "delivered",
    "completed",
    "cancelled",
  ]),
  reason: z.string().min(1).max(2000),
});

adminRouter.get("/me", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  res.json(user);
});

adminRouter.get("/dashboard/stats", async (_req: Request, res: Response) => {
  const [
    bookingCounts,
    refundedCount,
    eligibleAgg,
    vendorPending,
  ] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.booking.count({ where: { paymentStatus: "refunded" } }),
    prisma.booking.findMany({
      where: {
        status: { in: ["delivered", "completed"] },
        paymentStatus: "paid",
        payoutLines: { none: {} },
      },
      select: { totalAmount: true, serviceCharges: true },
    }),
    prisma.vendor.count({ where: { status: "pending" } }),
  ]);

  const pendingPayoutTotal = eligibleAgg.reduce(
    (sum, b) => sum + Number(vendorNetFromBooking(b)),
    0
  );

  const byStatus = Object.fromEntries(bookingCounts.map((r) => [r.status, r._count.id]));

  res.json({
    bookingsByStatus: byStatus,
    refundedBookings: refundedCount,
    pendingPayoutBookings: eligibleAgg.length,
    pendingPayoutTotal,
    vendorsPendingApproval: vendorPending,
  });
});

adminRouter.get("/bookings", async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const paymentStatus = typeof req.query.paymentStatus === "string" ? req.query.paymentStatus : undefined;
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "25"), 10)));
  const skip = (page - 1) * limit;

  const where: { status?: string; paymentStatus?: string } = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        vendor: { select: { id: true, businessName: true } },
        event: { select: { id: true, name: true, date: true } },
        package: { select: { id: true, name: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
});

adminRouter.get("/export/bookings.csv", async (_req: Request, res: Response) => {
  const rows = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      user: { select: { email: true } },
      vendor: { select: { businessName: true } },
      event: { select: { name: true, date: true } },
    },
  });

  const header =
    "bookingReference,status,paymentStatus,totalAmount,consumerEmail,vendorName,eventName,eventDate,createdAt\n";
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = rows.map((b) =>
    [
      b.bookingReference,
      b.status,
      b.paymentStatus,
      String(b.totalAmount),
      b.user.email,
      b.vendor.businessName,
      b.event.name,
      b.event.date.toISOString().slice(0, 10),
      b.createdAt.toISOString(),
    ]
      .map((c) => esc(String(c)))
      .join(",")
  );

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="bookings-export.csv"');
  res.send(header + lines.join("\n"));
});

adminRouter.get("/bookings/:id", async (req: Request, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      vendor: { select: { id: true, businessName: true, userId: true } },
      event: true,
      package: { include: { packageItems: { orderBy: { displayOrder: "asc" } } } },
      payoutLines: { include: { batch: { select: { id: true, status: true, paidAt: true, reference: true } } } },
    },
  });
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
});

adminRouter.post("/bookings/:id/refund", async (req: Request, res: Response) => {
  const parsed = refundBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const { reason } = parsed.data;
  const bookingId = req.params.id;
  const actorId = req.user!.userId;

  const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!existing) return res.status(404).json({ error: "Booking not found" });
  if (existing.paymentStatus === "refunded") {
    return res.status(400).json({ error: "Booking already refunded" });
  }
  if (existing.paymentStatus !== "paid") {
    return res.status(400).json({ error: "Only paid bookings can be refunded" });
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "refunded",
        refundedAt: new Date(),
        refundReason: reason,
      },
    });
  });
  await logAdminAction({
    actorUserId: actorId,
    action: "booking.refund",
    entityType: "booking",
    entityId: bookingId,
    metadata: { reason },
  });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true } },
      vendor: { select: { businessName: true, userId: true } },
      event: { select: { name: true } },
    },
  });

  if (booking) {
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: "booking_refunded",
        title: "Refund processed",
        message: `Your payment for ${booking.event.name} was refunded.`,
        link: `/bookings/${booking.id}`,
        metadata: { targetApp: "consumer" },
      },
    });
    await prisma.notification.create({
      data: {
        userId: booking.vendor.userId,
        type: "booking_refunded_vendor",
        title: "Booking refunded",
        message: `Refund issued for ${booking.event.name} (${booking.bookingReference}).`,
        link: `/bookings/${booking.id}`,
        metadata: { targetApp: "vendor" },
      },
    });
  }

  res.json({ ok: true, bookingId });
});

adminRouter.post("/bookings/:id/status", async (req: Request, res: Response) => {
  const parsed = adminStatusOverrideSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const { status, reason } = parsed.data;
  const bookingId = req.params.id;
  const actorId = req.user!.userId;

  const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!existing) return res.status(404).json({ error: "Booking not found" });

  const prev = existing.status;
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      ...(status === "cancelled" ? { cancellationReason: `Admin override: ${reason}` } : {}),
    },
  });

  await logAdminAction({
    actorUserId: actorId,
    action: "booking.status_override",
    entityType: "booking",
    entityId: bookingId,
    metadata: { previousStatus: prev, newStatus: status, reason },
  });

  res.json(updated);
});

adminRouter.get("/payouts/eligible", async (_req: Request, res: Response) => {
  const rows = await prisma.booking.findMany({
    where: {
      status: { in: ["delivered", "completed"] },
      paymentStatus: "paid",
      payoutLines: { none: {} },
    },
    include: {
      user: { select: { name: true, email: true } },
      vendor: { select: { id: true, businessName: true } },
      event: { select: { name: true, date: true } },
      package: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const items = rows.map((b) => ({
    ...b,
    vendorNet: vendorNetFromBooking(b).toString(),
  }));

  res.json({ items });
});

adminRouter.post("/payouts/batches", async (req: Request, res: Response) => {
  const parsed = payoutBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const { bookingIds, notes } = parsed.data;
  const actorId = req.user!.userId;

  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
  });

  if (bookings.length !== bookingIds.length) {
    return res.status(400).json({ error: "One or more bookings not found" });
  }

  for (const b of bookings) {
    if (!["delivered", "completed"].includes(b.status)) {
      return res.status(400).json({
        error: `Booking ${b.bookingReference} is not eligible (status must be delivered or completed)`,
      });
    }
    if (b.paymentStatus !== "paid") {
      return res.status(400).json({
        error: `Booking ${b.bookingReference} must be paid and not refunded`,
      });
    }
  }

  const existingLines = await prisma.payoutLine.findMany({
    where: { bookingId: { in: bookingIds } },
  });
  if (existingLines.length > 0) {
    return res.status(400).json({ error: "One or more bookings are already in a payout" });
  }

  const batch = await prisma.$transaction(async (tx) => {
    const batchRecord = await tx.payoutBatch.create({
      data: { status: "draft", notes: notes ?? null },
    });
    for (const b of bookings) {
      await tx.payoutLine.create({
        data: {
          batchId: batchRecord.id,
          vendorId: b.vendorId,
          bookingId: b.id,
          amount: vendorNetFromBooking(b),
          status: "pending",
        },
      });
    }
    return batchRecord;
  });
  await logAdminAction({
    actorUserId: actorId,
    action: "payout.batch_create",
    entityType: "payout_batch",
    entityId: batch.id,
    metadata: { bookingIds, notes },
  });

  const full = await prisma.payoutBatch.findUnique({
    where: { id: batch.id },
    include: { lines: { include: { booking: true, vendor: true } } },
  });

  res.status(201).json(full);
});

adminRouter.patch("/payouts/batches/:id/mark-paid", async (req: Request, res: Response) => {
  const parsed = markPaidSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const { reference } = parsed.data;
  const actorId = req.user!.userId;
  const batchId = req.params.id;

  const batch = await prisma.payoutBatch.findUnique({ where: { id: batchId } });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  if (batch.status === "paid") {
    return res.status(400).json({ error: "Batch already marked paid" });
  }

  const paidAt = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.payoutBatch.update({
      where: { id: batchId },
      data: { status: "paid", paidAt, reference: reference ?? null },
    });
    await tx.payoutLine.updateMany({
      where: { batchId },
      data: { status: "paid" },
    });
    await logAdminAction({
      actorUserId: actorId,
      action: "payout.batch_mark_paid",
      entityType: "payout_batch",
      entityId: batchId,
      metadata: { reference, paidAt: paidAt.toISOString() },
    });
  });

  const lines = await prisma.payoutLine.findMany({
    where: { batchId },
    include: { vendor: { select: { userId: true, businessName: true } } },
  });

  for (const line of lines) {
    await prisma.notification.create({
      data: {
        userId: line.vendor.userId,
        type: "payout_sent",
        title: "Payout recorded",
        message: `A payout of ${line.amount} BHD was marked paid for booking ${line.bookingId.slice(0, 8)}…`,
        link: `/bookings/${line.bookingId}`,
        metadata: { targetApp: "vendor", batchId },
      },
    });
  }

  const full = await prisma.payoutBatch.findUnique({
    where: { id: batchId },
    include: { lines: true },
  });
  res.json(full);
});

adminRouter.get("/payouts/batches", async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.payoutBatch.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        lines: {
          include: {
            vendor: { select: { businessName: true } },
            booking: { select: { bookingReference: true, totalAmount: true } },
          },
        },
      },
    }),
    prisma.payoutBatch.count(),
  ]);

  res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
});

adminRouter.get("/vendors", async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const where = status ? { status } : {};
  const vendors = await prisma.vendor.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true, status: true } },
    },
  });
  res.json({ items: vendors });
});

adminRouter.patch("/vendors/:id", async (req: Request, res: Response) => {
  const parsed = vendorStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const actorId = req.user!.userId;
  const vendor = await prisma.vendor.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
    include: { user: { select: { email: true, name: true } } },
  });

  await logAdminAction({
    actorUserId: actorId,
    action: "vendor.status",
    entityType: "vendor",
    entityId: vendor.id,
    metadata: { status: parsed.data.status },
  });

  res.json(vendor);
});

adminRouter.get("/users", async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const take = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "50"), 10)));
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : undefined,
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  res.json({ items: users });
});

adminRouter.patch("/users/:id", async (req: Request, res: Response) => {
  const parsed = userStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const actorId = req.user!.userId;
  const targetId = req.params.id;

  if (targetId === actorId) {
    return res.status(400).json({ error: "Cannot change your own account status" });
  }

  const user = await prisma.user.update({
    where: { id: targetId },
    data: { status: parsed.data.status },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  await logAdminAction({
    actorUserId: actorId,
    action: "user.status",
    entityType: "user",
    entityId: user.id,
    metadata: { status: parsed.data.status },
  });

  res.json(user);
});

adminRouter.get("/audit-log", async (req: Request, res: Response) => {
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || "50"), 10)));
  const rows = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { email: true, name: true } },
    },
  });
  res.json({ items: rows });
});
