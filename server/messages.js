const express = require('express');
const fs = require('fs');
const db = require('./db')

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"))



//GENERAL POST AND GET



//Get groups
app.get('/groups', (req, res) => {
    db.all('SELECT * FROM groups', [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message})
        res.json(rows)
    })
})

//Get specific group (with id)
app.get('/groups/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM groups WHERE id = ?', [groupId], (err, group) => {
        if (err || !group) return res.status(404).json({error: 'Group not found'});

        const response = { group }
        
        db.all('SELECT name FROM members WHERE group_id = ?', [groupId], (err, members) => {
        if (err) return res.status(500).json({error: err.message});

        response.members = members;
        
        db.all('SELECT sender, content, timestamp FROM messages WHERE group_id = ?', [groupId], (err, messages) => {
        if (err) return res.status(500).json({error: err.message});

        response.messages = messages;
        res.json(response)
            })
        })
    })
})

app.post('/groups', (req, res) => {
    const {name} = req.body;

    db.run('INSERT INTO groups (name) VALUES (?)', [name], function (err) {
        if (err) return res.status(400).json({error: err.message})
            res.status(201).json({id: this.lastID})
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})









/*MILESTONE 7 STUFF 
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