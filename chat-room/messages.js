const express = require('express');
const fs = require('fs');
const path = require('path')
const cors = require('cors')

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"))
app.use(cors())


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
})