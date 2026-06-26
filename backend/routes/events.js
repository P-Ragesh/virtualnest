const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const event = await prisma.event.create({
      data: req.body
    });

    // Create notifications for all users
    const users = await prisma.user.findMany();
    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'New Event Added',
          message: event.title,
          type: 'event',
          link: '/dashboard',
          relatedId: event.id
        }
      });
    }

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
