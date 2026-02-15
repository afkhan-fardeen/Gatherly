import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  createEventSchema,
  updateEventSchema,
  createGuestSchema,
  updateGuestSchema,
} from "@gatherly/shared";

export const eventsRouter = Router();
eventsRouter.use(authMiddleware);

// Guest routes (must be before /:id to avoid conflict)
eventsRouter.get("/:eventId/guests", async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { id: req.params.eventId, userId: req.user!.userId },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  const guests = await prisma.guest.findMany({
    where: { eventId: req.params.eventId },
    orderBy: { createdAt: "asc" },
  });
  res.json(guests);
});

eventsRouter.post("/:eventId/guests", async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { id: req.params.eventId, userId: req.user!.userId },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  const parsed = createGuestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const guest = await prisma.guest.create({
    data: {
      eventId: req.params.eventId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      category: parsed.data.category || null,
      dietaryPreferences: parsed.data.dietaryPreferences ?? [],
      rsvpStatus: parsed.data.rsvpStatus,
      plusOneAllowed: parsed.data.plusOneAllowed,
      notes: parsed.data.notes || null,
    },
  });
  res.status(201).json(guest);
});

eventsRouter.put("/:eventId/guests/:guestId", async (req, res) => {
  const existing = await prisma.guest.findFirst({
    where: {
      id: req.params.guestId,
      eventId: req.params.eventId,
      event: { userId: req.user!.userId },
    },
  });
  if (!existing) return res.status(404).json({ error: "Guest not found" });
  const parsed = updateGuestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const guest = await prisma.guest.update({
    where: { id: req.params.guestId },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.email !== undefined && { email: parsed.data.email || null }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone || null }),
      ...(parsed.data.category !== undefined && { category: parsed.data.category || null }),
      ...(parsed.data.dietaryPreferences !== undefined && {
        dietaryPreferences: parsed.data.dietaryPreferences,
      }),
      ...(parsed.data.rsvpStatus && { rsvpStatus: parsed.data.rsvpStatus }),
      ...(parsed.data.plusOneAllowed !== undefined && {
        plusOneAllowed: parsed.data.plusOneAllowed,
      }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes || null }),
    },
  });
  res.json(guest);
});

eventsRouter.delete("/:eventId/guests/:guestId", async (req, res) => {
  const existing = await prisma.guest.findFirst({
    where: {
      id: req.params.guestId,
      eventId: req.params.eventId,
      event: { userId: req.user!.userId },
    },
  });
  if (!existing) return res.status(404).json({ error: "Guest not found" });
  await prisma.guest.delete({ where: { id: req.params.guestId } });
  res.status(204).send();
});

// Event routes
eventsRouter.get("/", async (req, res) => {
  const userId = req.user!.userId;
  const events = await prisma.event.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { _count: { select: { guests: true } } },
  });
  res.json(events);
});

eventsRouter.post("/", async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const event = await prisma.event.create({
    data: {
      userId: req.user!.userId,
      name: data.name,
      eventType: data.eventType,
      date: new Date(data.date),
      timeStart: data.timeStart ? new Date(`1970-01-01T${data.timeStart}`) : null,
      timeEnd: data.timeEnd ? new Date(`1970-01-01T${data.timeEnd}`) : null,
      guestCount: data.guestCount,
      location: data.location,
      venueType: data.venueType,
      venueName: data.venueName,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      specialRequirements: data.specialRequirements,
      dietaryRequirements: data.dietaryRequirements ?? [],
    },
  });
  res.status(201).json(event);
});

eventsRouter.get("/:id", async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { guests: true },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

eventsRouter.put("/:id", async (req, res) => {
  const existing = await prisma.event.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!existing) return res.status(404).json({ error: "Event not found" });

  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.eventType && { eventType: data.eventType }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.timeStart !== undefined && {
        timeStart: data.timeStart ? new Date(`1970-01-01T${data.timeStart}`) : null,
      }),
      ...(data.timeEnd !== undefined && {
        timeEnd: data.timeEnd ? new Date(`1970-01-01T${data.timeEnd}`) : null,
      }),
      ...(data.guestCount && { guestCount: data.guestCount }),
      ...(data.location && { location: data.location }),
      ...(data.venueType !== undefined && { venueType: data.venueType }),
      ...(data.venueName !== undefined && { venueName: data.venueName }),
      ...(data.budgetMin !== undefined && { budgetMin: data.budgetMin }),
      ...(data.budgetMax !== undefined && { budgetMax: data.budgetMax }),
      ...(data.specialRequirements !== undefined && {
        specialRequirements: data.specialRequirements,
      }),
      ...(data.dietaryRequirements !== undefined && {
        dietaryRequirements: data.dietaryRequirements,
      }),
    },
  });
  res.json(event);
});

eventsRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.event.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!existing) return res.status(404).json({ error: "Event not found" });
  await prisma.event.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
