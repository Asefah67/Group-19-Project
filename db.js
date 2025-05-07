const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error("Error connecting to database:", err.message);
  else console.log("Connected to SQLite database");
});

// Ensure table has className column
const ensureSchema = () => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        className TEXT NOT NULL
      )`);
  
      db.run(`CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )`);
  
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupName TEXT,
        sender TEXT,
        content TEXT,
        timestamp TEXT
      )`);
    });
};
  
  
ensureSchema();
module.exports = db;
