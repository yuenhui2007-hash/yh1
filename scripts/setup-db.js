const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    role TEXT DEFAULT 'user',
    plan TEXT DEFAULT 'starter',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT DEFAULT 'beginner',
    duration_minutes INTEGER,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    progress REAL DEFAULT 0,
    status TEXT DEFAULT 'in_progress',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    plan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`
];

let i = 0;
function createNext() {
  if (i >= tables.length) {
    // Seed courses
    const courses = [
      ['AI Fundamentals', 'Learn the basics of AI and machine learning', 'Technical', 'beginner', 120],
      ['Leadership Essentials', 'Core leadership skills for managers', 'Leadership', 'intermediate', 90],
      ['Data Privacy & Compliance', 'GDPR, CCPA, and data protection', 'Compliance', 'beginner', 60],
      ['Effective Communication', 'Business communication skills', 'Soft Skills', 'beginner', 75],
      ['Cloud Architecture', 'AWS, Azure, and GCP fundamentals', 'Technical', 'advanced', 180],
      ['Cybersecurity Basics', 'Protect your organization', 'Technical', 'beginner', 100]
    ];
    
    let c = 0;
    function seedNext() {
      if (c >= courses.length) {
        console.log('Database setup complete');
        console.log(`Database: ${dbPath}`);
        db.close();
        return;
      }
      db.run('INSERT OR IGNORE INTO courses (title, description, category, difficulty, duration_minutes) VALUES (?, ?, ?, ?, ?)', courses[c], (err) => {
        if (err) console.error(err);
        c++;
        seedNext();
      });
    }
    seedNext();
    return;
  }
  db.run(tables[i], (err) => {
    if (err) console.error(err);
    i++;
    createNext();
  });
}

createNext();