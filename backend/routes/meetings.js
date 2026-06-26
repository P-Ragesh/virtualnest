const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { startTime: 'desc' }
    });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings
router.post('/', async (req, res) => {
  try {
    const meeting = await prisma.meeting.create({
      data: req.body
    });

    // Create notifications for participants if participants
    if (req.body.participants) {
      for (const userId of req.body.participants) {
        await prisma.notification.create({
          data: {
            userId: userId,
            title: 'New Meeting Scheduled',
            message: meeting.title,
            type: 'meeting',
            link: '/dashboard',
            relatedId: meeting.id
          }
        });
      }
    }

    res.status(201).json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/meetings/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.meeting.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
