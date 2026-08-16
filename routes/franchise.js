const express = require('express');
const { getDB, saveDB } = require('../db/database');
const router = express.Router();

// POST /api/franchise
router.post('/', (req, res) => {
  const { name, email, phone, city, investment_capacity } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  db.run(`INSERT INTO franchise_applications (name, email, phone, city, investment_capacity) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, city, investment_capacity]);
  saveDB();
  res.json({ success: true, message: 'Application submitted! We will contact you within 48 hours.' });
});

// GET /api/franchise
router.get('/', (req, res) => {
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  const result = db.exec('SELECT * FROM franchise_applications ORDER BY created_at DESC');
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

// PATCH /api/franchise/:id
router.patch('/:id', (req, res) => {
  const { status, notes } = req.body;
  const db = getDB();
  db.run(`UPDATE franchise_applications SET status = ?, notes = ? WHERE id = ?`, [status, notes, req.params.id]);
  saveDB();
  res.json({ success: true });
});

// DELETE /api/franchise/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM franchise_applications WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
