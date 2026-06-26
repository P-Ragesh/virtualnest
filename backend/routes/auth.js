const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'virtualnest-secret-change-in-prod';
const SALT_ROUNDS = 12;

// Check and seed default accounts on load
async function ensureDefaultAccountsExist() {
  try {
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@virtualnest.com' } });
    if (!adminExists) {
      const adminHash = await bcrypt.hash('admin', SALT_ROUNDS);
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@virtualnest.com',
          passwordHash: adminHash,
          role: 'admin'
        }
      });
      console.log('[Auth] Default admin account seeded: admin@virtualnest.com / admin');
    }
    const employeeExists = await prisma.user.findUnique({ where: { email: 'employee@virtualnest.com' } });
    if (!employeeExists) {
      const employeeHash = await bcrypt.hash('employee', SALT_ROUNDS);
      await prisma.user.create({
        data: {
          username: 'employee',
          email: 'employee@virtualnest.com',
          passwordHash: employeeHash,
          role: 'employee'
        }
      });
      console.log('[Auth] Default employee account seeded: employee@virtualnest.com / employee');
    }
  } catch (err) {
    console.error('[Auth] Failed to seed default accounts: ', err);
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role: role || 'employee' }
    });
    res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    await ensureDefaultAccountsExist(); // Ensure default accounts exist
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, username: user.username, email: user.email },
      JWT_SECRET, { expiresIn: '8h' }
    );
    res.json({ accessToken, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
