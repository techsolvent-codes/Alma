const express = require('express');
const { getDB, saveDB } = require('../db/database');
const router = express.Router();

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  db.run(`INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`, [name, email, message]);
  saveDB();
  res.json({ success: true, message: 'Message sent successfully!' });
});

// GET /api/contact (admin)
router.get('/', (req, res) => {
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  const result = db.exec('SELECT * FROM contacts ORDER BY created_at DESC');
  if (!result.length) return res.json([]);
  const [cols, ...rows] = [result[0].columns, ...result[0].values];
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

// PATCH /api/contact/:id
router.patch('/:id', (req, res) => {
  const { status } = req.body;
  const db = getDB();
  db.run(`UPDATE contacts SET status = ? WHERE id = ?`, [status, req.params.id]);
  saveDB();
  res.json({ success: true });
});

// DELETE /api/contact/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM contacts WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
