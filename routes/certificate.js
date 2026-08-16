const express = require('express');
const { getDB, saveDB } = require('../db/database');
const router = express.Router();

// POST /api/certificate - create
router.post('/', (req, res) => {
  const { cert_id, student_name, program, center, issue_date } = req.body;
  if (!cert_id || !student_name || !program) return res.status(400).json({ error: 'cert_id, student_name and program required' });
  const db = getDB();
  try {
    db.run(`INSERT INTO certificates (cert_id, student_name, program, center, issue_date) VALUES (?, ?, ?, ?, ?)`,
      [cert_id, student_name, program, center, issue_date]);
    saveDB();
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Certificate ID already exists' });
  }
});

// GET /api/certificate/verify/:certId - public verification
router.get('/verify/:certId', (req, res) => {
  const db = getDB();
  const result = db.exec(`SELECT * FROM certificates WHERE cert_id = '${req.params.certId}'`);
  if (!result.length || !result[0].values.length) return res.json({ valid: false });
  const cols = result[0].columns;
  const cert = Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]));
  res.json({ valid: cert.status === 'active', certificate: cert });
});

// GET /api/certificate - all (admin)
router.get('/', (req, res) => {
  const db = getDB();
  const result = db.exec('SELECT * FROM certificates ORDER BY created_at DESC');
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

// PATCH /api/certificate/:id
router.patch('/:id', (req, res) => {
  const { status } = req.body;
  const db = getDB();
  db.run(`UPDATE certificates SET status = ? WHERE id = ?`, [status, req.params.id]);
  saveDB();
  res.json({ success: true });
});

// DELETE /api/certificate/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM certificates WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
