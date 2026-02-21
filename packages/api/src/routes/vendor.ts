import { Router, Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { vendorAuthMiddleware } from "../middleware/vendorAuth.js";

export const vendorRouter = Router();

const vendorAuth = [authMiddleware, vendorAuthMiddleware];

const dayHoursSchema = z.object({
  open: z.string().optional(),
  close: z.string().optional(),
});

const availabilitySchema = z.object({
  blockedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

const updateVendorSchema = z.object({
  businessName: z.string().min(1).optional(),
  businessType: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  cuisineTypes: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  physicalAddress: z.string().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  featuredImageUrl: z.string().url().nullable().optional(),
  operatingHours: z
    .record(z.string(), dayHoursSchema)
    .nullable()
    .optional(),
});

const createPackageSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  packageType: z.string().nullable().optional(),
  priceType: z.enum(["per_person", "fixed"]),
  basePrice: z.number().positive(),
  minGuests: z.number().int().positive().nullable().optional(),
  maxGuests: z.number().int().positive().nullable().optional(),
  setupFee: z.number().min(0).optional(),
  serviceChargePercent: z.number().min(0).optional(),
  dietaryTags: z.array(z.string()).optional(),
  imageUrl: z.string().url().nullable().optional(),
});

const updatePackageSchema = createPackageSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "in_preparation", "delivered", "completed"]),
});

const createPackageItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  dietaryTags: z.array(z.string()).optional(),
  allergenWarnings: z.array(z.string()).optional(),
  displayOrder: z.number().int().min(0).optional(),
  imageUrl: z.string().url().nullable().optional(),
});

const updatePackageItemSchema = createPackageItemSchema.partial();

vendorRouter.get("/me", vendorAuth, async (req: Request, res: Response) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: req.vendor!.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  if (!vendor) {
    return res.status(404).json({ error: "Vendor not found" });
  }

  res.json(vendor);
});

const ALLOWED_BUSINESS_TYPES = ["catering"] as const;

vendorRouter.patch("/me", vendorAuth, async (req: Request, res: Response) => {
  const parsed = updateVendorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  if (parsed.data.businessType != null && !ALLOWED_BUSINESS_TYPES.includes(parsed.data.businessType as (typeof ALLOWED_BUSINESS_TYPES)[number])) {
    return res.status(400).json({
      error: "Category not available yet",
      details: { fieldErrors: { businessType: ["Only Catering is available. Other categories coming soon."] } },
    });
  }

  const raw = parsed.data;
  const data: Record<string, unknown> = {};
  if (raw.businessName !== undefined) data.businessName = raw.businessName;
  if (raw.businessType !== undefined) data.businessType = raw.businessType;
  if (raw.ownerName !== undefined) data.ownerName = raw.ownerName;
  if (raw.description !== undefined) data.description = raw.description;
  if (raw.cuisineTypes !== undefined) data.cuisineTypes = raw.cuisineTypes;
  if (raw.serviceAreas !== undefined) data.serviceAreas = raw.serviceAreas;
  if (raw.physicalAddress !== undefined) data.physicalAddress = raw.physicalAddress;
  if (raw.logoUrl !== undefined) data.logoUrl = raw.logoUrl;
  if (raw.featuredImageUrl !== undefined) data.featuredImageUrl = raw.featuredImageUrl;
  if (raw.operatingHours !== undefined) {
    data.operatingHours = raw.operatingHours === null ? Prisma.JsonNull : raw.operatingHours;
  }
  const vendor = await prisma.vendor.update({
    where: { id: req.vendor!.id },
    data: data as Parameters<typeof prisma.vendor.update>[0]["data"],
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  res.json(vendor);
});

vendorRouter.get("/availability", vendorAuth, async (req: Request, res: Response) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: req.vendor!.id },
    select: { availability: true },
  });
  const availability = (vendor?.availability as { blockedDates?: string[] } | null) ?? { blockedDates: [] };
  res.json(availability);
});

vendorRouter.put("/availability", vendorAuth, async (req: Request, res: Response) => {
  const parsed = availabilitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  await prisma.vendor.update({
    where: { id: req.vendor!.id },
    data: {
      availability: { blockedDates: parsed.data.blockedDates ?? [] },
    },
  });
  res.json({ blockedDates: parsed.data.blockedDates ?? [] });
});

vendorRouter.get("/packages", vendorAuth, async (req: Request, res: Response) => {
  const packages = await prisma.package.findMany({
    where: { vendorId: req.vendor!.id },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: {
      packageItems: { orderBy: { displayOrder: "asc" } },
      vendor: { select: { featuredImageUrl: true, logoUrl: true } },
    },
  });

  res.json(packages);
});

vendorRouter.post("/packages", vendorAuth, async (req: Request, res: Response) => {
  const parsed = createPackageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const pkg = await prisma.package.create({
    data: {
      vendorId: req.vendor!.id,
      ...parsed.data,
      setupFee: parsed.data.setupFee ?? 0,
      serviceChargePercent: parsed.data.serviceChargePercent ?? 0,
      dietaryTags: parsed.data.dietaryTags ?? [],
      imageUrl: parsed.data.imageUrl ?? null,
    },
  });

  res.status(201).json(pkg);
});

vendorRouter.patch("/packages/:id", vendorAuth, async (req: Request, res: Response) => {
  const existing = await prisma.package.findFirst({
    where: { id: req.params.id, vendorId: req.vendor!.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Package not found" });
  }

  const parsed = updatePackageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const pkg = await prisma.package.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  res.json(pkg);
});

vendorRouter.delete("/packages/:id", vendorAuth, async (req: Request, res: Response) => {
  const existing = await prisma.package.findFirst({
    where: { id: req.params.id, vendorId: req.vendor!.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Package not found" });
  }

  await prisma.package.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.status(204).send();
});

async function ensurePackageOwned(req: Request, packageId: string) {
  const pkg = await prisma.package.findFirst({
    where: { id: packageId, vendorId: req.vendor!.id },
  });
  return pkg;
}

vendorRouter.post("/packages/:id/items", vendorAuth, async (req: Request, res: Response) => {
  const pkg = await ensurePackageOwned(req, req.params.id);
  if (!pkg) {
    return res.status(404).json({ error: "Package not found" });
  }

  const parsed = createPackageItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const maxOrder = await prisma.packageItem.findFirst({
    where: { packageId: pkg.id },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  const item = await prisma.packageItem.create({
    data: {
      packageId: pkg.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      dietaryTags: parsed.data.dietaryTags ?? [],
      allergenWarnings: parsed.data.allergenWarnings ?? [],
      displayOrder: parsed.data.displayOrder ?? (maxOrder ? maxOrder.displayOrder + 1 : 0),
      imageUrl: parsed.data.imageUrl ?? null,
    },
  });

  res.status(201).json(item);
});

vendorRouter.patch("/packages/:id/items/:itemId", vendorAuth, async (req: Request, res: Response) => {
  const pkg = await ensurePackageOwned(req, req.params.id);
  if (!pkg) {
    return res.status(404).json({ error: "Package not found" });
  }

  const existing = await prisma.packageItem.findFirst({
    where: { id: req.params.itemId, packageId: pkg.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Package item not found" });
  }

  const parsed = updatePackageItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const item = await prisma.packageItem.update({
    where: { id: req.params.itemId },
    data: parsed.data,
  });

  res.json(item);
});

vendorRouter.delete("/packages/:id/items/:itemId", vendorAuth, async (req: Request, res: Response) => {
  const pkg = await ensurePackageOwned(req, req.params.id);
  if (!pkg) {
    return res.status(404).json({ error: "Package not found" });
  }

  const existing = await prisma.packageItem.findFirst({
    where: { id: req.params.itemId, packageId: pkg.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Package item not found" });
  }

  await prisma.packageItem.delete({
    where: { id: req.params.itemId },
  });

  res.status(204).send();
});

// GET /api/vendor/search?q=... - search bookings and packages
vendorRouter.get("/search", vendorAuth, async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const vendorId = req.vendor!.id;

  if (q.length < 2) {
    return res.json({ bookings: [], packages: [] });
  }

  const [bookings, packages] = await Promise.all([
    prisma.booking.findMany({
      where: {
        vendorId,
        OR: [
          { bookingReference: { contains: q, mode: "insensitive" } },
          { user: { name: { contains: q, mode: "insensitive" } } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { event: { name: { contains: q, mode: "insensitive" } } },
          { package: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        event: { select: { name: true, date: true } },
        package: { select: { name: true } },
      },
    }),
    prisma.package.findMany({
      where: {
        vendorId,
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, imageUrl: true, basePrice: true, priceType: true },
    }),
  ]);

  res.json({ bookings, packages });
});

vendorRouter.get("/bookings", vendorAuth, async (req: Request, res: Response) => {
  const { status } = req.query;

  const where: { vendorId: string; status?: string | { in: string[] } } = {
    vendorId: req.vendor!.id,
  };
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
      user: { select: { id: true, name: true, email: true } },
      event: { select: { name: true, date: true, guestCount: true } },
      package: { select: { name: true, imageUrl: true } },
    },
  });

  res.json(bookings);
});

vendorRouter.get("/bookings/:id", vendorAuth, async (req: Request, res: Response) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, vendorId: req.vendor!.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
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
          packageItems: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  res.json(booking);
});

vendorRouter.patch("/bookings/:id/status", vendorAuth, async (req: Request, res: Response) => {
  const existing = await prisma.booking.findFirst({
    where: { id: req.params.id, vendorId: req.vendor!.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const parsed = updateBookingStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const newStatus = parsed.data.status;
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: {
      status: newStatus,
      ...(newStatus === "cancelled"
        ? { cancellationReason: "Declined by vendor" }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      event: { select: { name: true, date: true, guestCount: true } },
      package: { select: { name: true, imageUrl: true } },
    },
  });

  const notifTypes: Record<string, { type: string; title: string; message: string }> = {
    confirmed: {
      type: "booking_confirmed",
      title: "Booking confirmed",
      message: `${req.vendor!.businessName} confirmed your booking for ${booking.event.name}`,
    },
    cancelled: {
      type: "booking_declined",
      title: "Booking declined",
      message: `Your booking for ${booking.event.name} was declined`,
    },
    in_preparation: {
      type: "booking_in_preparation",
      title: "Order in preparation",
      message: `${req.vendor!.businessName} is preparing your order for ${booking.event.name}`,
    },
    delivered: {
      type: "booking_delivered",
      title: "Order delivered",
      message: `Your catering for ${booking.event.name} has been delivered`,
    },
    completed: {
      type: "booking_completed",
      title: "Booking completed",
      message: `Your booking for ${booking.event.name} is complete. Leave a review!`,
    },
  };
  const notif = notifTypes[newStatus];
  if (notif) {
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        link: "/bookings",
        metadata: { targetApp: "consumer" },
      },
    });
  }

  res.json(booking);
});

vendorRouter.get("/reviews", vendorAuth, async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
  const skip = (page - 1) * limit;

  const [vendor, reviews, total] = await Promise.all([
    prisma.vendor.findUnique({
      where: { id: req.vendor!.id },
      select: { ratingAvg: true, ratingCount: true },
    }),
    prisma.review.findMany({
      where: { vendorId: req.vendor!.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { name: true } },
        booking: { include: { package: { select: { name: true, imageUrl: true } } } },
      },
    }),
    prisma.review.count({ where: { vendorId: req.vendor!.id } }),
  ]);

  res.json({
    overall: {
      rating: Number(vendor?.ratingAvg ?? 0),
      count: vendor?.ratingCount ?? 0,
    },
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
