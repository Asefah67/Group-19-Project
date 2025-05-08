const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');


module.exports = db;

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  )`);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupName TEXT,
      sender TEXT,
      content TEXT,
      timestamp TEXT
    )
  `);
  })

db.close(() => {
  console.log('Database schema created.');
});

