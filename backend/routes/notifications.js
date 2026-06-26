const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// GET /api/notifications - Get all notifications for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// POST /api/notifications - Create a notification (for testing)
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type, link, relatedId } = req.body;
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        relatedId
      }
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;
