import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

export const paymentMethodsRouter = Router();
paymentMethodsRouter.use(authMiddleware);

const addCardSchema = z.object({
  number: z.string().regex(/^\d{13,19}$/, "Card number must be 13-19 digits"),
  brand: z.enum(["visa", "mastercard", "amex"]).optional(),
});

// GET /api/payment-methods - list saved cards for consumer
paymentMethodsRouter.get("/", async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const methods = await prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ items: methods });
});

// POST /api/payment-methods - add a card (dummy - no real processing)
paymentMethodsRouter.post("/", async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const parsed = addCardSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid card number";
    return res.status(400).json({ error: msg });
  }
  const { number } = parsed.data;
  const last4 = number.slice(-4);
  let brand = parsed.data.brand ?? "visa";
  if (!parsed.data.brand) {
    if (number.startsWith("4")) brand = "visa";
    else if (number.startsWith("5") || number.startsWith("2")) brand = "mastercard";
    else if (number.startsWith("3")) brand = "amex";
  }
  const method = await prisma.paymentMethod.create({
    data: { userId, last4, brand },
  });
  res.status(201).json(method);
});

// DELETE /api/payment-methods/:id
paymentMethodsRouter.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const method = await prisma.paymentMethod.findFirst({
    where: { id, userId },
  });
  if (!method) {
    return res.status(404).json({ error: "Payment method not found" });
  }
  await prisma.paymentMethod.delete({ where: { id } });
  res.json({ ok: true });
});
