import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { vendorAuthMiddleware } from "../middleware/vendorAuth.js";

export const spotlightVendorRouter = Router();
const vendorAuth = [authMiddleware, vendorAuthMiddleware];

// Dummy pricing in BHD
const SPOTLIGHT_PRICING = [
  { durationDays: 3, amountBhd: 5 },
  { durationDays: 7, amountBhd: 10 },
];

const purchaseSchema = z.object({
  packageId: z.string().uuid(),
  durationDays: z.union([z.literal(3), z.literal(7)]),
});

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/vendor/spotlight/active - vendor's currently active spotlight placements
spotlightVendorRouter.get("/active", vendorAuth, async (req: Request, res: Response) => {
  const now = today();
  const placements = await prisma.spotlightPlacement.findMany({
    where: {
      vendorId: req.vendor!.id,
      status: "active",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          basePrice: true,
          priceType: true,
        },
      },
    },
    orderBy: { endDate: "asc" },
  });

  res.json(
    placements.map((p) => ({
      id: p.id,
      packageId: p.packageId,
      package: p.package,
      durationDays: p.durationDays,
      amountBhd: Number(p.amountBhd),
      startDate: p.startDate,
      endDate: p.endDate,
      daysLeft: Math.ceil((p.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    }))
  );
});

// GET /api/vendor/spotlight/pricing
spotlightVendorRouter.get("/pricing", vendorAuth, (_req: Request, res: Response) => {
  res.json(SPOTLIGHT_PRICING);
});

// POST /api/vendor/spotlight/purchase - dummy payment
spotlightVendorRouter.post("/purchase", vendorAuth, async (req: Request, res: Response) => {
  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const { packageId, durationDays } = parsed.data;
  const vendorId = req.vendor!.id;

  const now = today();
  const pkg = await prisma.package.findFirst({
    where: { id: packageId, vendorId },
    include: { vendor: { select: { featuredImageUrl: true, logoUrl: true } } },
  });
  if (!pkg || !pkg.isActive) {
    return res.status(404).json({ error: "Package not found or inactive" });
  }

  const existingActive = await prisma.spotlightPlacement.findFirst({
    where: { packageId, vendorId, status: "active", endDate: { gte: now } },
  });
  if (existingActive) {
    return res.status(400).json({ error: "This package is already in spotlight. Wait for it to expire before adding again." });
  }

  const price = SPOTLIGHT_PRICING.find((p) => p.durationDays === durationDays);
  if (!price) {
    return res.status(400).json({ error: "Invalid duration" });
  }

  const startDate = today();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  const placement = await prisma.spotlightPlacement.create({
    data: {
      packageId,
      vendorId,
      durationDays,
      amountBhd: price.amountBhd,
      startDate,
      endDate,
    },
  });

  const maxOrder = await prisma.package.findFirst({
    where: { isSpotlight: true },
    orderBy: { spotlightOrder: "desc" },
    select: { spotlightOrder: true },
  });
  const nextOrder = (maxOrder?.spotlightOrder ?? 0) + 1;

  await prisma.package.update({
    where: { id: packageId },
    data: { isSpotlight: true, spotlightOrder: nextOrder },
  });

  res.status(201).json({
    placement: {
      id: placement.id,
      packageId,
      durationDays,
      amountBhd: Number(placement.amountBhd),
      startDate: placement.startDate,
      endDate: placement.endDate,
    },
    message: "Spotlight activated! Your package is now featured.",
  });
});
