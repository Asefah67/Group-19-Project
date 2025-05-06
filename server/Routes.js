const express = require('express');
const eventBus = require('./eventBus')
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"))
app.use(cors())


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

  function add_group (groupName) {
    db.run('INSERT INTO groups (name) VALUES (?)', [groupName], function(err) {
      if (err) {
        return ({ error: 'Failed to create group' });
      }
        
      const newGroup = {id: this.lastID, name: groupName}
      eventBus.emit('groupCreated', newGroup)
      
      return ({ message: 'Group created', groupId: this.lastID });
    });


  }

  app.post('/groups', (req, res) => {
      const { groupName } = req.body;
  
      db.get('SELECT * FROM groups WHERE name = ?', [groupName], (err, row) => {
          if (err) {
              return res.status(500).json({ error: 'Database error' });
          }
          
          if (row) {
              return res.status(400).json({ message: 'Group already exists' });
          }

          add_group(groupName)
      });
  });


//Get specific group (with id)
app.get('/groups/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM groups WHERE id = ?', [id], (err, group) => {
        if (err) return res.status(404).json({error: 'Group not found'});

        if (!group) {
          add_group(id)
        };

        const response = { group }
        
        db.all('SELECT name FROM members WHERE group_id = ?', [id], (err, members) => {
        if (err) return res.status(500).json({error: err.message});

        response.members = members;
        
        db.all('SELECT sender, content, timestamp FROM messages WHERE group_id = ?', [id], (err, messages) => {
        if (err) return res.status(500).json({error: err.message});

        response.messages = messages;
        res.json(response)
            })
        })
    })
})


app.post('/groups/:groupName/messages', (req, res) => {
  const groupName = req.params.groupName;
  const { sender, content } = req.body;

  if (!sender || !content) {
    return res.status(400).json({ error: 'Sender and content are required.' });
  }

  // Check if group exists
  db.get(`SELECT name FROM groups WHERE name = ?`, [groupName], (err, group) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!group) {
      add_group(groupName)
    }

    const timestamp = new Date().toISOString();

    const sql = `
      INSERT INTO messages (groupName, sender, content, timestamp)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [groupName, sender, content, timestamp], function (err) {
      if (err) {
        console.error('Insert error:', err.message);
        return res.status(500).json({ error: err.message });
      }

      db.get(`SELECT * FROM messages WHERE id = ?`, [this.lastID], (err, message) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(message);
      });
    });
  });
});



// GET /groups/:groupName/messages
app.get('/groups/:groupName/messages', (req, res) => {
  const { groupName } = req.params;
  const after = req.query.after;

  const query = after
    ? `SELECT * FROM messages WHERE groupName = ? AND timestamp > ? ORDER BY timestamp ASC`
    : `SELECT * FROM messages WHERE groupName = ? ORDER BY timestamp ASC`;

  const params = after ? [groupName, after] : [groupName];

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Message fetch error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

  
  


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})









/*MILESTONE 6 STUFF 
const filepath = path.join(__dirname, '../server/data/messages.json')
async function readMessages() {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data)
}

function storeMessage(message, group_ID) {
    const data = readMessages()
    if (!data.messages) {
        data.messages = {}
    }

    if (!Array.isArray(data.messages[group_ID])) {
        data.messages[group_ID] = [message]
    } else {
        data.messages[group_ID].push(message)
    }
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')

    return true
}


app.get('/chat-room', (req, res) => {
  
    // Read the JSON file asynchronously
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
        return res.status(500).json({ error: 'Failed to read messages from file' });
      }
  
      // Parse the JSON data
      const messages = JSON.parse(data);
      
      // Send the parsed messages as a response
      res.json(messages);
    });
  });

app.post('/chat-room', (req, res) => {
    console.log("Received POST request");
    const {msg, current_gc} = req.body;


    if (!msg || !current_gc) {
        return res.status(400).json({error: "Missing either msg or gc"})
    }

    const data = {
        text: msg,
        name: "Anonymous",
        created: new Date(),

    }

    if (storeMessage(data, current_gc)){
        res.json({success: true, message: "Message Stored!"})
    };
})

app.listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}`)
})*/