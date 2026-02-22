import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const spotlightRouter = Router();

// GET /api/spotlight - public, returns spotlight packages (paid placement)
// Includes: packages with active SpotlightPlacement OR legacy isSpotlight (seed)
spotlightRouter.get("/", async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clear isSpotlight for packages whose paid placements have all expired (keeps seed packages)
  const withPlacements = await prisma.package.findMany({
    where: { isSpotlight: true, spotlightPlacements: { some: {} } },
    select: { id: true },
  });
  for (const pkg of withPlacements) {
    const hasActive = await prisma.spotlightPlacement.findFirst({
      where: { packageId: pkg.id, endDate: { gte: today }, status: "active" },
    });
    if (!hasActive) {
      await prisma.package.update({
        where: { id: pkg.id },
        data: { isSpotlight: false, spotlightOrder: null },
      });
    }
  }

  const packages = await prisma.package.findMany({
    where: {
      isActive: true,
      OR: [
        {
          spotlightPlacements: {
            some: {
              status: "active",
              startDate: { lte: today },
              endDate: { gte: today },
            },
          },
        },
        { isSpotlight: true },
      ],
    },
    orderBy: [{ spotlightOrder: "asc" }, { displayOrder: "asc" }],
    include: {
      vendor: {
        select: {
          id: true,
          businessName: true,
          logoUrl: true,
          featuredImageUrl: true,
        },
      },
    },
  });

  res.json(
    packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      imageUrl: pkg.imageUrl || pkg.vendor.logoUrl || pkg.vendor.featuredImageUrl,
      basePrice: pkg.basePrice,
      priceType: pkg.priceType,
      vendorId: pkg.vendorId,
      vendor: pkg.vendor,
    }))
  );
});
