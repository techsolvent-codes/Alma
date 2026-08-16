const path = require('path');
const fs = require('fs');
let db = null;

function initDB() {
  const initSqlJs = require('sql.js');
  const dbPath = path.join(__dirname, 'alma.db');

  initSqlJs().then((SQL) => {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('✅ Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('✅ New database created');
    }

    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS franchise_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        city TEXT,
        investment_capacity TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS community_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        program TEXT,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS press_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        organization TEXT,
        email TEXT NOT NULL,
        purpose TEXT,
        type TEXT DEFAULT 'press_card',
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cert_id TEXT UNIQUE NOT NULL,
        student_name TEXT NOT NULL,
        program TEXT NOT NULL,
        center TEXT,
        issue_date TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS franchisee_centers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT,
        phone TEXT,
        email TEXT,
        type TEXT DEFAULT 'standard',
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS media_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'news',
        body TEXT,
        author TEXT,
        image_url TEXT,
        published INTEGER DEFAULT 0,
        published_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Seed default centers
    const centersCount = db.exec('SELECT COUNT(*) as c FROM franchisee_centers');
    if (centersCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO franchisee_centers (name, city, country, phone, email, type) VALUES
        ('ALMA Greenwich', 'London', 'UK', '+44 20 7946 0123', 'greenwich@alma.edu', 'standard'),
        ('ALMA Marina', 'Dubai', 'UAE', '+971 4 321 4567', 'marina@alma.edu', 'premium'),
        ('ALMA Orchard', 'Singapore', 'Singapore', '+65 6789 0123', 'orchard@alma.edu', 'standard'),
        ('ALMA Bandra', 'Mumbai', 'India', '+91 22 4567 8901', 'bandra@alma.edu', 'standard');`);
    }

    // Seed sample certificates
    const certCount = db.exec('SELECT COUNT(*) as c FROM certificates');
    if (certCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO certificates (cert_id, student_name, program, center, issue_date, status) VALUES
        ('ALMA-2024-0001', 'Elena Mist', 'Digital Marketing', 'ALMA Greenwich', '2024-01-15', 'active'),
        ('ALMA-2024-0002', 'Julian Harth', 'Computer Education', 'ALMA Marina', '2024-02-20', 'active');`);
    }

    // Seed contacts
    const contactsCount = db.exec('SELECT COUNT(*) as c FROM contacts');
    if (contactsCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO contacts (name, email, message, status) VALUES
        ('Jane Doe', 'jane@example.com', 'Interested in expanding my digital literacy limits.', 'new'),
        ('Mark Smith', 'mark@example.com', 'How long are the courses?', 'read');`);
    }

    // Seed franchise apps
    const franchiseAppCount = db.exec('SELECT COUNT(*) as c FROM franchise_applications');
    if (franchiseAppCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO franchise_applications (name, email, phone, city, investment_capacity, status) VALUES
        ('Global Reach Partners', 'partners@global.eu', '+442345678', 'Berlin', 'High', 'approved'),
        ('TechHub Academy', 'info@techhub.com', '+123456789', 'Austin', 'Medium', 'pending');`);
    }

    // Seed community apps
    const communityAppCount = db.exec('SELECT COUNT(*) as c FROM community_applications');
    if (communityAppCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO community_applications (name, email, phone, program, message) VALUES
        ('Open Source Collective', 'contact@os-coll.org', '123-444-5555', 'Digital Literacy Drive', 'We want to collaborate on global curriculum.');`);
    }

    // Seed press apps
    const pressCount = db.exec('SELECT COUNT(*) as c FROM press_applications');
    if (pressCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO press_applications (name, organization, email, purpose, type, status) VALUES
        ('Sarah Jenkins', 'Tech Review', 'sarah.j@techreview.com', 'Keynote Coverage', 'press_card', 'approved'),
        ('Dave Chen', 'Education Weekly', 'd.chen@eduweekly.org', 'Interview with core team', 'interview', 'pending');`);
    }

    // Seed media articles
    const mediaCount = db.exec('SELECT COUNT(*) as c FROM media_articles');
    if (mediaCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO media_articles (title, category, body, author, published, published_at) VALUES
        ('Global Summit: Digital Sanctity in AI', 'news', 'ALMA announces its annual conference keynote speakers.', 'ALMA PR', 1, datetime('now','-2 days')),
        ('New Campus: Singapore Hub', 'news', 'Opening our first Physical-Digital hybrid center in Southeast Asia.', 'ALMA PR', 1, datetime('now','-5 days')),
        ('Strategic Partnership with Quantum Labs', 'press', 'Revolutionizing course delivery speeds through new edge protocols.', 'ALMA PR', 1, datetime('now','-10 days'));`);
    }

    // Seed subscribers
    const subCount = db.exec('SELECT COUNT(*) as c FROM newsletter_subscribers');
    if (subCount[0].values[0][0] === 0) {
      db.run(`INSERT INTO newsletter_subscribers (email) VALUES
        ('student.fan@gmail.com'),
        ('corp.training@enterprise.net'),
        ('tech.curious@domain.com');`);
    }

    // Seed default admin
    const bcrypt = require('bcryptjs');
    const adminCount = db.exec('SELECT COUNT(*) as c FROM admin_users');
    if (adminCount[0].values[0][0] === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT INTO admin_users (username, password_hash) VALUES ('admin', '${hash}');`);
      console.log('✅ Default admin created: admin / admin123');
    }

    saveDB();
    console.log('✅ Database initialized');
  }).catch(err => console.error('DB init error:', err));
}

function saveDB() {
  if (!db) return;
  const dbPath = path.join(__dirname, 'alma.db');
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getDB() { return db; }

module.exports = { initDB, getDB, saveDB };
