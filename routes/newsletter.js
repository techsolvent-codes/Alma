const express = require('express');
const { getDB, saveDB } = require('../db/database');
const router = express.Router();

router.post('/', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const db = getDB();
  try {
    db.run(`INSERT INTO newsletter_subscribers (email) VALUES (?)`, [email]);
    saveDB();
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch {
    res.status(400).json({ error: 'Email already subscribed' });
  }
});

router.get('/', (req, res) => {
  const db = getDB();
  const result = db.exec('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

router.delete('/:id', (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM newsletter_subscribers WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
