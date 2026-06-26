const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

router.use(authMiddleware);

// GET /api/leave - List leave requests
router.get('/', async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    const where = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (status) where.status = status;

    const leaves = await prisma.leave.findMany({
      where,
      include: { employee: true },
      orderBy: { appliedAt: 'desc' }
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leave/balances - Calculate leave balances
// Basic rules: 12 sick, 12 casual, 15 earned leaves allocated annually. Unpaid has no limit.
router.get('/balances/:employeeId', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: 'approved'
      }
    });

    const limits = { sick: 12, casual: 12, earned: 15, unpaid: 999 };
    const used = { sick: 0, casual: 0, earned: 0, unpaid: 0 };

    approvedLeaves.forEach(l => {
      const type = l.leaveType.toLowerCase();
      const diffTime = Math.abs(new Date(l.toDate) - new Date(l.fromDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (used[type] !== undefined) {
        used[type] += diffDays;
      }
    });

    const balances = {};
    Object.keys(limits).forEach(k => {
      balances[k] = {
        limit: limits[k],
        used: used[k],
        remaining: Math.max(0, limits[k] - used[k])
      };
    });

    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leave - Apply for leave
router.post('/', async (req, res) => {
  try {
    const { employeeId, leaveType, fromDate, toDate, reason } = req.body;

    if (!employeeId || !leaveType || !fromDate || !toDate) {
      return res.status(400).json({ error: 'Missing required leave fields' });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Validate date range
    if (from > to) {
      return res.status(400).json({ error: 'From date cannot be after To date' });
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) }
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Check overlapping leaves
    const overlap = await prisma.leave.findFirst({
      where: {
        employeeId: parseInt(employeeId),
        status: { in: ['pending', 'approved'] },
        OR: [
          { fromDate: { lte: to }, toDate: { gte: from } }
        ]
      }
    });
    if (overlap) {
      return res.status(400).json({ error: 'Leave request overlaps with an existing leave request' });
    }

    const newLeave = await prisma.leave.create({
      data: {
        employeeId: parseInt(employeeId),
        leaveType,
        fromDate: from,
        toDate: to,
        reason,
        status: 'pending'
      },
      include: { employee: true }
    });

    res.status(201).json(newLeave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leave/:id - Approve / Reject leave
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: { employee: true }
    });
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });

    const updated = await prisma.leave.update({
      where: { id },
      data: { status },
      include: { employee: true }
    });

    // Find user by employee's email
    let user = await prisma.user.findUnique({
      where: { email: leave.employee.email }
    });

    // If user doesn't exist, create one
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      let username = leave.employee.email.split('@')[0];
      const usernameExists = await prisma.user.findUnique({ where: { username } });
      if (usernameExists) {
        username = `${username}${leave.employee.id}`;
      }
      user = await prisma.user.create({
        data: {
          username,
          email: leave.employee.email,
          passwordHash: hashedPassword,
          role: 'employee'
        }
      });
    }

    if (status === 'approved' || status === 'rejected') {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: status === 'approved' ? 'Leave Approved' : 'Leave Rejected',
          message: `Your leave request for ${leave.leaveType} leave from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been ${status}.`,
          type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
          link: '/leave',
          relatedId: leave.id
        }
      });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leave/:id - Delete a leave request
router.delete('/:id', async (req, res) => {
  try {
    await prisma.leave.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Leave record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
