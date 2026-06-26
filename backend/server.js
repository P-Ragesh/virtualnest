const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Set DB path before Prisma loads
process.env.DATABASE_URL = `file:${process.env.DB_PATH || path.join(__dirname, 'prisma/dev.db')}`;

const app = express();
const PORT = process.env.PORT || 3001;

// Helmet config: Allow unsafe-inline for Dev and styles, disable contentSecurityPolicy in Dev mode if needed
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5175', 'http://127.0.0.1:5175', 'file://'] }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/payroll',       require('./routes/payroll'));
app.use('/api/leave',         require('./routes/leave'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/settings',      require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/meetings',      require('./routes/meetings'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/projects',      require('./routes/projects'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[VirtualNest Backend] Running on http://127.0.0.1:${PORT}`);
});
