const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5501;

const messages_Route = require('./')

app.use(express.static(path.join(__dirname, 'public')));

app.get('server\data\rooms\groups.json', (req, res) => {
    const jsonPath = path.join(__dirname, 'data', 'groups.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    res.json(JSON.parse(jsonData));
});

app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:5501`)
})