const express = require('express');
const { getDB, saveDB } = require('../db/database');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, organization, email, purpose, type } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const db = getDB();
  db.run(`INSERT INTO press_applications (name, organization, email, purpose, type) VALUES (?, ?, ?, ?, ?)`,
    [name, organization, email, purpose, type || 'press_card']);
  saveDB();
  res.json({ success: true, message: 'Press application submitted!' });
});

router.get('/', (req, res) => {
  const db = getDB();
  const result = db.exec('SELECT * FROM press_applications ORDER BY created_at DESC');
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

router.patch('/:id', (req, res) => {
  const { status } = req.body;
  const db = getDB();
  db.run(`UPDATE press_applications SET status = ? WHERE id = ?`, [status, req.params.id]);
  saveDB();
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM press_applications WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
