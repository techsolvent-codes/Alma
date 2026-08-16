const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, saveDB } = require('../db/database');
const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'alma_secret_2024';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  const result = db.exec(`SELECT * FROM admin_users WHERE username = '${username}'`);
  if (!result.length || !result[0].values.length) return res.status(401).json({ error: 'Invalid credentials' });
  const [id, uname, hash, role] = result[0].values[0];
  if (!bcrypt.compareSync(password, hash)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id, username: uname, role }, SECRET, { expiresIn: '24h' });
  res.json({ token, username: uname, role });
});

module.exports = router;
