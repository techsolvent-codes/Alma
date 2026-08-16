const express = require('express');
const { getDB, saveDB } = require('../db/database');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/media - public (published only)
router.get('/', (req, res) => {
  const db = getDB();
  const { category } = req.query;
  let query = 'SELECT * FROM media_articles WHERE published = 1';
  if (category) query += ` AND category = '${category}'`;
  query += ' ORDER BY published_at DESC';
  const result = db.exec(query);
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

// GET /api/media/all - admin (all)
router.get('/all', (req, res) => {
  const db = getDB();
  const result = db.exec('SELECT * FROM media_articles ORDER BY created_at DESC');
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))));
});

// POST /api/media
router.post('/', upload.single('image'), (req, res) => {
  const { title, category, body, author, published } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const db = getDB();
  const isPub = published === 'true' || published === true;
  const pub_at = isPub ? new Date().toISOString() : null;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(`INSERT INTO media_articles (title, category, body, author, image_url, published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, category || 'news', body ?? null, author ?? null, image_url, isPub ? 1 : 0, pub_at]);
  saveDB();
  res.json({ success: true });
});

// POST /api/media/upload-inline
router.post('/upload-inline', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  const image_url = `/uploads/${req.file.filename}`;
  res.json({ url: image_url });
});

// PATCH /api/media/:id
router.patch('/:id', upload.single('image'), (req, res) => {
  const { title, category, body, author, image_url, published } = req.body;
  const db = getDB();
  const isPub = published === 'true' || published === true;
  const pub_at = isPub ? new Date().toISOString() : null;
  
  if (req.file) {
    const new_image_url = `/uploads/${req.file.filename}`;
    db.run(`UPDATE media_articles SET title=?, category=?, body=?, author=?, image_url=?, published=?, published_at=? WHERE id=?`,
      [title ?? null, category ?? null, body ?? null, author ?? null, new_image_url, isPub ? 1 : 0, pub_at, req.params.id]);
  } else {
    db.run(`UPDATE media_articles SET title=?, category=?, body=?, author=?, image_url=?, published=?, published_at=? WHERE id=?`,
      [title ?? null, category ?? null, body ?? null, author ?? null, image_url ?? null, isPub ? 1 : 0, pub_at, req.params.id]);
  }
  saveDB();
  res.json({ success: true });
});

// DELETE /api/media/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM media_articles WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
