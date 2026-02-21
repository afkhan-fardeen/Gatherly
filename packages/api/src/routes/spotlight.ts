import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const spotlightRouter = Router();

// GET /api/spotlight - public, returns spotlight packages (paid placement)
spotlightRouter.get("/", async (_req, res) => {
  const packages = await prisma.package.findMany({
    where: { isActive: true, isSpotlight: true },
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
      imageUrl: pkg.imageUrl || pkg.vendor.featuredImageUrl || pkg.vendor.logoUrl,
      basePrice: pkg.basePrice,
      priceType: pkg.priceType,
      vendorId: pkg.vendorId,
      vendor: pkg.vendor,
    }))
  );
});
