require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const visitRoutes = require('./routes/visits');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check — used by frontend to verify backend is reachable
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    database: db.isMock ? 'Mock In-Memory DB' : 'Supabase PostgreSQL',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Booqasho App Backend REST API is running successfully.',
    environment: process.env.NODE_ENV || 'development',
    database: db.isMock ? 'Mock In-Memory DB' : 'Supabase PostgreSQL'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message || err);
  res.status(500).json({
    success: false,
    message: 'Cilad baa ka dhacday server-ka.'
  });
});

async function startServer() {
  try {
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`🚀 [SERVER] Booqasho App Backend running on http://localhost:${PORT}`);
      if (db.isMock) {
        console.log('👤 Demo login: admin@booqasho.com / admin123');
        console.log('👤 Demo login: marketing@booqasho.com / marketing123');
      }
    });
  } catch (err) {
    console.error('❌ [SERVER] Failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
