const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const cors = require('cors')

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"))
app.use(cors())


const filepath = path.join(__dirname, 'messages.json');

function readMessages() {
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


router.get('/messages', (req, res) => {
    const data = readMessages();
    res.json(data.messages)
})

router.post('/chat-room', (req, res) => {
    const {message, group_id} = req.body;

    if (!message || !group_id) {
        return res.status(400).json({error: 'Missing Message or ID'})
    }


    data.messages.push({
        text: message,
        name: "Anonymous",
        created: new Date(),

    })

    if (storeMessage(data)){
        res.json({success: true, message: "Message Stored!"})
    };
})

app.listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}`)
})

module.exports = router;