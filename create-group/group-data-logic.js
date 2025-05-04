const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

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
  });
};

ensureSchema();

router.get('/groups', (req, res) => {
  const query = `
    SELECT g.id, g.name AS groupName, g.className, m.name AS memberName
    FROM groups g
    LEFT JOIN members m ON g.id = m.group_id
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const groups = {};
    rows.forEach(({ id, groupName, className, memberName }) => {
      if (!groups[id]) {
        groups[id] = { groupName, className, members: [] };
      }
      if (memberName) groups[id].members.push(memberName);
    });

    res.json(Object.values(groups));
  });
});

router.post('/create-group', (req, res) => {
  const { className, groupName } = req.body;

  if (!className || !groupName) {
    return res.status(400).json({ error: 'Missing className or groupName' });
  }

  db.get(`SELECT * FROM groups WHERE name = ? AND className = ?`, [groupName, className], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Group already exists for that class' });

    db.run(`INSERT INTO groups(name, className) VALUES (?, ?)`, [groupName, className], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Group created successfully', id: this.lastID });
    });
  });
});

router.post('/join-group', (req, res) => {
  const { className, groupName, username } = req.body;

  if (!className || !groupName || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get(`SELECT id FROM groups WHERE name = ? AND className = ?`, [groupName, className], (err, group) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    db.get(`SELECT * FROM members WHERE group_id = ? AND name = ?`, [group.id, username], (err, member) => {
      if (err) return res.status(500).json({ error: err.message });

      if (member) {
        return res.status(200).json({ message: 'User already a member of the group' });
      }

      db.run(`INSERT INTO members(group_id, name) VALUES (?, ?)`, [group.id, username], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(200).json({ message: 'User added to group' });
      });
    });
  });
});

module.exports = router;
