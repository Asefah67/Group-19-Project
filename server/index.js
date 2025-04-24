import express   from 'express';
import cors      from 'cors';
import fs        from 'fs';
import path      from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- middleware ---------- */
app.use(cors());
app.use(express.json());

/* serve EVERY front-end file */
app.use(express.static(path.join(__dirname, '..')));

// serve all files in the parent “room-booking” folder as static
app.use(
    express.static(path.join(__dirname, '..')),
    express.static(path.join(__dirname, '../js'))
  );
  
/* ---------- routes ---------- */
// GET /api/rooms?location=du-bois&date=2025-04-10
app.get('/api/rooms', (req, res) => {
  const location = (req.query.location || 'du-bois').toLowerCase();
  const date     = req.query.date;                           // yyyy-mm-dd
  if (!date) return res.status(400).json({ error:'Missing date' });

  const file = path.join(__dirname, 'data', 'rooms', `${location}-${date}.json`);
  fs.readFile(file, 'utf8', (err, json) => {
    if (err) return res.status(404).json({ error:'No data for that day/loc' });
    res.json(JSON.parse(json));
  });
});

// POST /api/reservations   → appends to data/reservations.json
app.post('/api/reservations', (req, res) => {
  const dbFile = path.join(__dirname, 'data', 'reservations.json');
  fs.readFile(dbFile, 'utf8', (err, json) => {
    const arr = err ? [] : JSON.parse(json);
    arr.push(req.body);
    fs.writeFile(dbFile, JSON.stringify(arr, null, 2), () =>
      res.json({ status:'ok' })
    );
  });
});

/* ---------- start ---------- */
app.listen(PORT, () => console.log(`API & static server on http://localhost:${PORT}`));
