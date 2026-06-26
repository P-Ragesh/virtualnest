const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/tasks (Admin: all tasks)
router.get('/', async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      tasks = await prisma.task.findMany({
        include: { employee: true, project: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      const employee = await prisma.employee.findUnique({
        where: { email: req.user.email }
      });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      tasks = await prisma.task.findMany({
        where: { assignedTo: employee.id },
        include: { employee: true, project: true },
        orderBy: { createdAt: 'desc' }
      });
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/my (Employee: my tasks)
router.get('/my', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { email: req.user.email }
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const tasks = await prisma.task.findMany({
      where: { assignedTo: employee.id },
      include: { project: true },
      orderBy: { dueDate: 'asc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: req.body,
      include: { employee: true, project: true }
    });

    // Find user by employee's email
    let user = await prisma.user.findUnique({
      where: { email: task.employee.email }
    });

    // If user doesn't exist, create one automatically
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      let username = task.employee.email.split('@')[0];
      // Make sure username is unique
      const usernameExists = await prisma.user.findUnique({ where: { username } });
      if (usernameExists) {
        username = `${username}${task.employee.id}`;
      }
      user = await prisma.user.create({
        data: {
          username,
          email: task.employee.email,
          passwordHash: hashedPassword,
          role: 'employee'
        }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        type: 'task_assigned',
        link: '/my-tasks',
        relatedId: task.id
      }
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateData = { ...req.body };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status) {
      updateData.completedAt = null;
    }
    
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: updateData,
      include: { project: true }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
