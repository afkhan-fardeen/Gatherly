import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

export const vendorsRouter = Router();

// Public routes (no auth required for browsing)
vendorsRouter.get("/", async (req, res) => {
  const { search, cuisine, status, businessType } = req.query;
  const where: Record<string, unknown> = {};

  // Show all vendors by default; use ?status=approved to filter
  if (typeof status === "string" && status === "approved") {
    where.status = "approved";
  }

  if (typeof businessType === "string" && businessType.trim()) {
    where.businessType = businessType.trim();
  }

  if (typeof search === "string" && search.trim()) {
    where.OR = [
      { businessName: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  if (typeof cuisine === "string" && cuisine.trim()) {
    where.cuisineTypes = { has: cuisine.trim() };
  }

  const vendors = await prisma.vendor.findMany({
    where,
    orderBy: [{ ratingAvg: "desc" }, { totalBookings: "desc" }],
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { basePrice: "asc" },
        select: {
          id: true,
          name: true,
          basePrice: true,
          priceType: true,
          minGuests: true,
          maxGuests: true,
        },
      },
    },
  });

  // Return vendors with min/max capacity across all packages
  const result = vendors.map((v) => {
    const pkgList = (v.packages as { minGuests: number | null; maxGuests: number | null }[]) ?? [];
    const minCap = pkgList.reduce((m, p) => (p.minGuests != null && (m == null || p.minGuests < m) ? p.minGuests : m), null as number | null);
    const maxCap = pkgList.reduce((m, p) => (p.maxGuests != null && (m == null || p.maxGuests > m) ? p.maxGuests : m), null as number | null);
    const cheapest = pkgList[0];
    return {
      ...v,
      packages: cheapest ? [cheapest] : [],
      minCapacity: minCap,
      maxCapacity: maxCap,
    };
  });

  res.json(result);
});

vendorsRouter.get("/:id", async (req, res) => {
  const vendor = await prisma.vendor.findFirst({
    where: { id: req.params.id },
  });
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });
  res.json(vendor);
});

vendorsRouter.get("/:id/packages", async (req, res) => {
  const vendor = await prisma.vendor.findFirst({
    where: { id: req.params.id },
  });
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });

  const packages = await prisma.package.findMany({
    where: { vendorId: req.params.id, isActive: true },
    include: { packageItems: { orderBy: { displayOrder: "asc" } } },
    orderBy: { displayOrder: "asc" },
  });

  res.json(packages);
});

vendorsRouter.get("/:id/reviews", async (req, res) => {
  const vendor = await prisma.vendor.findFirst({
    where: { id: req.params.id },
  });
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });

  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit || "10"), 10)));
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { vendorId: req.params.id, status: "published" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { name: true } } },
    }),
    prisma.review.count({ where: { vendorId: req.params.id, status: "published" } }),
  ]);

  res.json({
    items: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
