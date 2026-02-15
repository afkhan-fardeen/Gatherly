import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export interface VendorRecord {
  id: string;
  userId: string;
  businessName: string;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      vendor?: VendorRecord;
    }
  }
}

/** Use after authMiddleware. Verifies role === "vendor" and loads vendor. */
export async function vendorAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "vendor") {
    return res.status(403).json({ error: "Vendor access required" });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.userId },
    select: { id: true, userId: true, businessName: true, status: true },
  });

  if (!vendor) {
    return res.status(403).json({ error: "Vendor profile not found" });
  }

  req.vendor = vendor;
  next();
}
