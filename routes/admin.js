const express = require('express');
const { getDB } = require('../db/database');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'DB not ready' });

  const q = (sql) => {
    const r = db.exec(sql);
    return r.length ? r[0].values[0][0] : 0;
  };

  res.json({
    contacts: q('SELECT COUNT(*) FROM contacts'),
    contactsNew: q("SELECT COUNT(*) FROM contacts WHERE status = 'new'"),
    franchiseApps: q('SELECT COUNT(*) FROM franchise_applications'),
    franchisePending: q("SELECT COUNT(*) FROM franchise_applications WHERE status = 'pending'"),
    communityApps: q('SELECT COUNT(*) FROM community_applications'),
    pressApps: q('SELECT COUNT(*) FROM press_applications'),
    certificates: q('SELECT COUNT(*) FROM certificates'),
    activeCenters: q('SELECT COUNT(*) FROM franchisee_centers WHERE active = 1'),
    totalCenters: q('SELECT COUNT(*) FROM franchisee_centers'),
    mediaArticles: q('SELECT COUNT(*) FROM media_articles WHERE published = 1'),
    subscribers: q('SELECT COUNT(*) FROM newsletter_subscribers'),
  });
});

module.exports = router;
