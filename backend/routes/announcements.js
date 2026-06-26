const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/announcements
router.post('/', async (req, res) => {
  try {
    const announcement = await prisma.announcement.create({
      data: req.body
    });

    // Get all users
    const users = await prisma.user.findMany();

    // Create notification for each user
    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'New Announcement',
          message: announcement.title,
          type: 'announcement',
          link: '/announcements',
          relatedId: announcement.id
        }
      });
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
