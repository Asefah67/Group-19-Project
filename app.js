/*  app.js  – ONE Express server for everything
 * ───────────────────────────────────────────────────────────
 *  Front‑end folders, all served statically:
 *      /Landing Page          (Canvas mock‑up)
 *      /create-group
 *      /chat-room
 *      /room-booking          ←  NEW
 *
 *  Back‑end:
 *      • SQLite  (database.sqlite at project root)
 *      • Reservations model via Sequelize
 *      • GET  /api/rooms?location=&date=
 *      • POST /api/reservations   (persists + overlays JSON)
 * ───────────────────────────────────────────────────────────*/

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

const app  = express();
const PORT = process.env.PORT || 3000;

/*───────────────────────── 1.  DB (Sequelize + SQLite) ─────────────────*/
const sequelize = new Sequelize({
  dialect : 'sqlite',
  storage : path.join(__dirname, 'database.sqlite'), // root‑level file
  logging : false,
});

const Reservation = sequelize.define('Reservation', {
  room     : { type: DataTypes.STRING, allowNull: false },
  time     : { type: DataTypes.STRING, allowNull: false },
  date     : { type: DataTypes.STRING, allowNull: false },   // yyyy-mm-dd
  location : { type: DataTypes.STRING, allowNull: false },
  name     : { type: DataTypes.STRING, allowNull: false },
  email    : { type: DataTypes.STRING, allowNull: false },
  group    : { type: DataTypes.STRING, allowNull: false },
});

/*───────────────────────── 2.  MIDDLEWARE / STATIC ─────────────────────*/
app.use(cors());
app.use(express.json());

/* ► Room‑booking UI */
app.use(
  '/room-booking',
  express.static(path.join(__dirname, 'room-booking'))
);

/* ► Study‑group UI */
app.use(
  '/create-group',
  express.static(path.join(__dirname, 'create-group'))
);

/* ► Chat‑room UI */
app.use(
  '/chat-room',
  express.static(path.join(__dirname, 'chat-room'))
);

/* ► Canvas landing page (fallback for anything else) */
app.use(express.static(path.join(__dirname, 'Landing Page')));

/*───────────────────────── 3.  OTHER TEAM ROUTES ───────────────────────*/
const groupRoutes = require('./create-group/group-data-logic');
const chatRoutes  = require('./Backend/Routes');
app.use('/', groupRoutes);
app.use('/', chatRoutes);

/*───────────────────────── 4.  BOOKING API ENDPOINTS ───────────────────*/

// GET /api/rooms?location=du-bois&date=2025-05-07
app.get('/api/rooms', (req, res) => {
  const loc  = slugify(req.query.location || 'du-bois');
  const date =  req.query.date;
  if (!date) return res.status(400).json({ error: 'Missing date' });

  const jsonPath = path.join(
    __dirname, 'server', 'data', 'rooms', `${loc}-${date}.json`
  );

  fs.readFile(jsonPath, 'utf8', (err, raw) => {
    if (err) return res.status(404).json({ error: 'No data for that day/loc' });
    res.json(JSON.parse(raw));
  });
});

// POST /api/reservations
app.post('/api/reservations', async (req, res) => {
  try {
    const {
      room, time, date,
      location, loc,
      name, email,
      group, groupSize, size,
    } = req.body;

    const finalLoc   = location ?? loc   ?? null;
    const finalGroup = group    ?? groupSize ?? size ?? null;

    if (![room, time, date, finalLoc, name, email, finalGroup].every(Boolean)) {
      console.warn('❌ 400 – bad payload:', req.body);
      return res.status(400).json({ error: 'Missing fields' });
    }

    /* 1) insert into SQLite */
    await Reservation.create({
      room, time, date,
      location: finalLoc,
      name, email,
      group: finalGroup,
    });

    /* 2) overlay “busy” into the day’s mock‑data JSON (if it exists) */
    const jsonPath = path.join(
      __dirname, 'server', 'data', 'rooms',
      `${finalLoc}-${date}.json`
    );

    fs.readFile(jsonPath, 'utf8', (err, raw) => {
      if (err) return; // no JSON file – silently skip
      try {
        const data = JSON.parse(raw);
        const idx  = data.rooms.findIndex(r => r.name === room);
        if (idx >= 0 && data.slots[idx][time] !== 'busy') {
          data.slots[idx][time] = 'busy';
          fs.writeFile(jsonPath, JSON.stringify(data, null, 2), () => {});
        }
      } catch {/* malformed JSON – ignore */ }
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('DB write failed:', err);
    res.status(500).json({ error: 'Server failure' });
  }
});

/*───────────────────────── 5.  LANDING PAGE ROOT ───────────────────────*/
app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'Landing Page', 'Canvas-Layout.html')
  );
});

/*───────────────────────── 6.  BOOTSTRAP ───────────────────────────────*/
(async () => {
  await sequelize.sync();   // create table if needed
  console.log('✅ Database synced');
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
})();

function slugify(val = '') {
  return val.toLowerCase()
            .replace(/[^\w]+/g, '-')   // spaces/punct → dash
            .replace(/^-+|-+$/g, '');
}

