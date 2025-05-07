const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

const eventBus = require('../Backend/eventBus');

const db = require('../db.js');

// Ensure table has className column
/*const ensureSchema = () => {
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

ensureSchema();*/

function add_group(groupName) {
  db.run('INSERT INTO groups (name) VALUES (?)', [groupName], function (err) {
    if (err) return;
    const newGroup = { id: this.lastID, name: groupName };
    eventBus.emit('groupCreated', newGroup);
  });
}

let lastGroupCreated = null;

router.get('/new-groups', (req, res) => {
  let timeout = setTimeout(() => {
    res.json({ message: "No new groups yet" }); // Prevent infinite loading
  }, 5000); // Send a response after 5 seconds if no group is created

  eventBus.removeAllListeners('groupCreated')
  eventBus.once('groupCreated', (group) => {
    if (!group || !group.name) {
      return res.json({message: "No new groups yet!"})
    } else { 
      if (group.id !== lastGroupCreated) {
      lastGroupCreated = group; // Update lastGroupCreated to the new group ID
      clearTimeout(timeout);
      console.log("New group detected:", group) // Cancel timeout when a group is created
      res.json(group); // Return new group data
      }
    }
  });
});

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
  console.log("Received body:", req.body); 

  if (!className || !groupName) {
    return res.status(400).json({ error: 'Missing className or groupName' });
  }

  db.get(`SELECT * FROM groups WHERE name = ? AND className = ?`, [groupName, className], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Group already exists for that class' });

    db.serialize(() => {
        db.run(`INSERT INTO groups(name, className) VALUES (?, ?)`, [groupName, className], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        eventBus.emit('groupCreated', { id: this.lastID, name: groupName, className });
        res.status(201).json({ message: 'Group created successfully', id: this.lastID });
          });
    })
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




//Ama's Routes!!!! <3 <3 <3
/*router.post('/groups', (req, res) => {
  const { groupName } = req.body;

  db.get('SELECT * FROM groups WHERE name = ?', [groupName], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(400).json({ message: 'Group already exists' });

    add_group(groupName);
    res.status(201).json({ message: 'Group created' });
  });
});*/


router.get('/groups/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM groups WHERE id = ?', [id], (err, group) => {
    if (err || !group) return res.status(404).json({ error: 'Group not found' });

    const response = { group };

    db.all('SELECT name FROM members WHERE group_id = ?', [id], (err, members) => {
      if (err) return res.status(500).json({ error: err.message });
      response.members = members;

      db.all('SELECT sender, content, timestamp FROM messages WHERE group_id = ?', [id], (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });
        response.messages = messages;
        res.json(response);
      });
    });
  });
});

router.post('/groups/:groupName/messages', (req, res) => {
  const { groupName } = req.params;
  const { sender, content } = req.body;

  if (!sender || !content) return res.status(400).json({ error: 'Sender and content are required.' });

  db.get(`SELECT name FROM groups WHERE name = ?`, [groupName], (err, group) => {
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (err) return res.status(500).json({ error: err.message });

    const timestamp = new Date().toISOString();
    const sql = `INSERT INTO messages (groupName, sender, content, timestamp) VALUES (?, ?, ?, ?)`;

    db.run(sql, [groupName, sender, content, timestamp], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get(`SELECT * FROM messages WHERE id = ?`, [this.lastID], (err, message) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(message);
      });
    });
  });
});

router.get('/groups/:groupName/messages', (req, res) => {
  const { groupName } = req.params;
  const after = req.query.after;

  const query = after
    ? `SELECT * FROM messages WHERE groupName = ? AND timestamp > ? ORDER BY timestamp ASC`
    : `SELECT * FROM messages WHERE groupName = ? ORDER BY timestamp ASC`;

  const params = after ? [groupName, after] : [groupName];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


router.get('/groups/:groupName/members', (req, res) => {
  const { groupName } = req.params;

  db.all(`SELECT name FROM members WHERE group_id = (SELECT id FROM groups WHERE name = ?)`, [groupName], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


router.delete('/groups/groupName/:memberName', (req, res) => {
  const { groupName } = req.params;
  const { memberName } = req.body;

  db.run(`DELETE FROM members WHERE group_id = (SELECT id FROM groups WHERE name = ?) AND name = ?`, [groupName, memberName], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member removed' });
  });
})


module.exports = router;
