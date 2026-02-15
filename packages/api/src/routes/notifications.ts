import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

export const notificationsRouter = Router();
notificationsRouter.use(authMiddleware);

// GET /api/notifications/unread-count - count unread notifications
notificationsRouter.get("/unread-count", async (req, res) => {
  const userId = req.user!.userId;
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  res.json({ count });
});

// GET /api/notifications - list notifications for authenticated user
notificationsRouter.get("/", async (req, res) => {
  const userId = req.user!.userId;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const cursor = req.query.cursor as string | undefined;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, -1) : notifications;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  res.json({ items, nextCursor, hasMore });
});

// PATCH /api/notifications/:id/read - mark one as read
notificationsRouter.patch("/:id/read", async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.json({ ok: true });
});

// PATCH /api/notifications/read-all - mark all as read
notificationsRouter.patch("/read-all", async (req, res) => {
  const userId = req.user!.userId;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  res.json({ ok: true });
});
