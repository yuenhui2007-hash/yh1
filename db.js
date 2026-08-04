const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
let db;

async function init() {
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
    createTables();
    save();
  }
  return db;
}

function save() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
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
    );
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      difficulty TEXT DEFAULT 'beginner',
      duration_minutes INTEGER,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      progress REAL DEFAULT 0,
      status TEXT DEFAULT 'in_progress',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      stripe_payment_intent_id TEXT,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      status TEXT DEFAULT 'pending',
      plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      status TEXT DEFAULT 'pending',
      billing_period TEXT,
      seats INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      stmt.run(params);
      stmt.free();
      save();
      resolve({ lastID: null, changes: 1 });
    } catch (err) {
      reject(err);
    }
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.getAsObject(params);
      stmt.free();
      resolve(Object.keys(result).length ? result : null);
    } catch (err) {
      reject(err);
    }
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { init, getDb: () => db, run, get, all, save };
