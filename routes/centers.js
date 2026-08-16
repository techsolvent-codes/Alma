const express = require('express');
const { getDB, saveDB } = require('../db/database');
const router = express.Router();

// GET /api/centers - public listing with optional search
router.get('/', (req, res) => {
  const db = getDB();
  const { city, country, type } = req.query;
  let query = 'SELECT * FROM franchisee_centers WHERE active = 1';
  if (city) query += ` AND city LIKE '%${city}%'`;
  if (country) query += ` AND country LIKE '%${country}%'`;
  if (type) query += ` AND type = '${type}'`;
  query += ' ORDER BY name';
  const result = db.exec(query);
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

// GET /api/centers/all - admin (includes inactive)
router.get('/all', (req, res) => {
  const db = getDB();
  const result = db.exec('SELECT * FROM franchisee_centers ORDER BY created_at DESC');
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

// POST /api/centers
router.post('/', (req, res) => {
  const { name, city, country, phone, email, type } = req.body;
  if (!name || !city) return res.status(400).json({ error: 'Name and city required' });
  const db = getDB();
  db.run(`INSERT INTO franchisee_centers (name, city, country, phone, email, type) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, city, country, phone, email, type || 'standard']);
  saveDB();
  res.json({ success: true });
});

// PATCH /api/centers/:id
router.patch('/:id', (req, res) => {
  const { name, city, country, phone, email, type, active } = req.body;
  const db = getDB();
  db.run(`UPDATE franchisee_centers SET name=?, city=?, country=?, phone=?, email=?, type=?, active=? WHERE id=?`,
    [name, city, country, phone, email, type, active, req.params.id]);
  saveDB();
  res.json({ success: true });
});

// DELETE /api/centers/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM franchisee_centers WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
