// server/index.js
import express   from 'express';
import cors      from 'cors';
import fs        from 'fs';
import path      from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// serve your static front-end…
app.use(express.static(path.join(__dirname, '..')));
app.use('/room-booking', express.static(path.join(__dirname, '../room-booking')));

// GET /api/rooms …
app.get('/api/rooms', (req, res) => {
  const location = (req.query.location || 'du-bois').toLowerCase();
  const date     = req.query.date;
  if (!date) return res.status(400).json({ error: 'Missing date' });

  const file = path.join(__dirname, 'data', 'rooms', `${location}-${date}.json`);
  fs.readFile(file, 'utf8', (err, json) => {
    if (err) return res.status(404).json({ error: 'No data for that day/loc' });
    res.json(JSON.parse(json));
  });
});

// POST /api/reservations
app.post('/api/reservations', (req, res) => {
  const dbFile = path.join(__dirname, 'data', 'reservations.json');
  fs.readFile(dbFile, 'utf8', (err, json) => {
    let arr = [];
    if (!err) {
      try {
        arr = JSON.parse(json);
      } catch {
        arr = [];  // if parse fails, start fresh
      }
    }
    arr.push(req.body);
    fs.writeFile(dbFile, JSON.stringify(arr, null, 2), writeErr => {
      if (writeErr) return res.status(500).json({ error: 'Failed to save' });
      res.json({ status: 'ok' });
    });
  });
});

app.listen(PORT, () =>
  console.log(`API & static server on http://localhost:${PORT}`)
);
