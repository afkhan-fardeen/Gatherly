import { z } from "zod";

const eventStatusSchema = z.enum(["draft", "in_progress", "completed", "cancelled"]);

export const createEventSchema = z.object({
  name: z.string().min(2, "Event name required"),
  eventType: z.string().min(1, "Event type required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  guestCount: z.number().int().min(1, "At least 1 guest"),
  location: z.string().min(1, "Location required"),
  venueType: z.string().optional(),
  venueName: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  specialRequirements: z.string().optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

export const updateEventSchema = createEventSchema
  .partial()
  .extend({ status: eventStatusSchema.optional() });

export const createGuestSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  category: z.string().optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  rsvpStatus: z.enum(["pending", "confirmed", "declined"]).default("pending"),
  plusOneAllowed: z.boolean().default(false),
  notes: z.string().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
