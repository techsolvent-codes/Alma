const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize DB
const { initDB, getDB } = require('./db/database');
initDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/franchise', require('./routes/franchise'));
app.use('/api/community', require('./routes/community'));
app.use('/api/press', require('./routes/press'));
app.use('/api/certificate', require('./routes/certificate'));
app.use('/api/centers', require('./routes/centers'));
app.use('/api/media', require('./routes/media'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test API
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test API is working!' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ALMA API Server running at http://localhost:${PORT}\n`);
});
