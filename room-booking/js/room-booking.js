// chrome-extension/views/room-booking/js/room-booking.js

// ─────── your API root ───────
const API = 'http://localhost:3000';

const $ = sel => document.querySelector(sel);

// ─────── set today's date in the picker ───────
(() => {
  const inp = $('#dateSel');
  if (!inp) return;
  inp.value = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
})();

// ─────── build 30-min slots from 8 am → 8 pm ───────
function buildTimes() {
  const out = [];
  for (let h = 8; h <= 20; h++) {
    out.push(`${h}:00`);
    if (h < 20) out.push(`${h}:30`);
  }
  return out;
}
const TIMES = buildTimes();

// ─────── selection state ───────
const chosen = new Set();
let currentMeta = {};

// ─────── load & draw whenever date or location changes ───────
async function loadDay() {
  // 1) set heading
  const [y, m, d] = $('#dateSel').value.split('-').map(Number);
  $('#dateHeading').textContent = new Date(y, m - 1, d).toDateString();

  // 2) fetch from back-end
  const loc  = ($('#locationSel').value || 'du-bois').toLowerCase();
  const date = $('#dateSel').value; // "YYYY-MM-DD"
  try {
    const res = await fetch(`${API}/api/rooms?location=${loc}&date=${date}`);
    if (!res.ok) throw new Error('No data for that day/loc');
    const data = await res.json();
    drawGrid(data);
  } catch (err) {
    console.warn(err);
    $('#gridWrapper').innerHTML =
      `<p style="color:#c0392b">No mock data for that day.</p>`;
    $('#confirmBtn').disabled = true;
    chosen.clear();
  }
}

// wire change events
$('#dateSel').addEventListener('change', loadDay);
$('#locationSel')?.addEventListener('change', loadDay);

// initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDay);
} else {
  loadDay();
}

// ─────── draw the grid ───────
function drawGrid(data) {
  const wrap = $('#gridWrapper');
  wrap.innerHTML = '';

  const g = document.createElement('div');
  g.className = 'slot-grid';
  g.style.gridTemplateColumns = `200px repeat(${TIMES.length},50px)`;

  // header row
  g.appendChild(document.createElement('div'));
  TIMES.forEach(t => {
    const h = document.createElement('div');
    h.className = 'slot-head';
    h.textContent = t;
    g.appendChild(h);
  });

  // room rows
  data.rooms.forEach((room, idx) => {
    const lbl = document.createElement('div');
    lbl.className = 'slot-room';
    lbl.textContent = `${room.name} (Cap ${room.cap})`;
    g.appendChild(lbl);

    TIMES.forEach(t => {
      const cell = document.createElement('div');
      const busy = data.slots[idx][t] === 'busy';
      cell.className = `slot-cell ${busy ? 'busy' : 'free'}`;
      cell.dataset.room = room.name;
      cell.dataset.time = t;
      if (!busy) cell.addEventListener('click', () => toggle(cell));
      g.appendChild(cell);
    });
  });

  wrap.appendChild(g);
}

// ─────── selection UX ───────
function toggle(cell) {
  const key = `${cell.dataset.room}|${cell.dataset.time}`;
  if (chosen.has(key)) {
    chosen.delete(key);
    cell.classList.remove('chosen');
  } else {
    chosen.clear();
    document.querySelectorAll('.chosen').forEach(c => c.classList.remove('chosen'));
    chosen.add(key);
    cell.classList.add('chosen');
  }
  renderSelection();
}

function renderSelection() {
  const list = $('#selectionList');
  list.innerHTML = '';

  if (!chosen.size) {
    $('#confirmBtn').disabled = true;
    return;
  }

  const [room, time] = [...chosen][0].split('|');
  currentMeta = {
    room,
    time,
    date: $('#dateSel').value,
    loc:  $('#locationSel')?.value || 'du-bois'
  };

  const li = document.createElement('li');
  li.textContent = `${room} – ${time}`;
  const trash = document.createElement('span');
  trash.className = 'trash';
  trash.textContent = '🗑';
  trash.addEventListener('click', () => { chosen.clear(); renderSelection(); });
  li.appendChild(trash);
  list.appendChild(li);

  $('#confirmBtn').disabled = false;
}

// ─────── confirmation modal & POST ───────
$('#confirmBtn').addEventListener('click', openConfirmation);

function openConfirmation() {
  // backdrop
  const bg = document.createElement('div');
  bg.style.cssText =
    'position:fixed;inset:0;background:#0008;display:flex;align-items:center;justify-content:center;z-index:99';

  // modal box
  const box = document.createElement('div');
  box.style.cssText =
    'background:#fff;padding:2rem 2.5rem;border-radius:6px;max-width:420px;width:100%';

  box.innerHTML = `
    <h2 style="margin-top:0">Booking Details</h2>
    <table style="width:100%;margin-bottom:1rem;border-collapse:collapse">
      <tr><th align="left">Room</th><td>${currentMeta.room}</td></tr>
      <tr><th align="left">Date</th><td>${new Date(currentMeta.date).toDateString()}</td></tr>
      <tr><th align="left">Time</th><td>${currentMeta.time}</td></tr>
    </table>
    <p>Please confirm your information</p>
    <label>Full Name*<br><input id="fullName" style="width:100%"></label><br><br>
    <label>Email (@umass.edu)*<br><input id="email" style="width:100%"></label><br><br>
    <label>Group Size*<br>
      <select id="groupSize" style="width:100%">
        <option value="">Select…</option>
        <option>3–5</option>
        <option>More than 5</option>
      </select>
    </label><br><br>
    <button id="submitBtn"
      style="padding:.5rem 1rem;background:#26a65b;color:#fff;border:none;border-radius:4px">
      Submit my Booking
    </button>`;

  bg.appendChild(box);
  document.body.appendChild(bg);

  // POST handler
  $('#submitBtn').addEventListener('click', async () => {
    if (
      !$('#fullName').value ||
      !$('#email').value.endsWith('@umass.edu') ||
      !$('#groupSize').value
    ) {
      alert('Please fill out every required field.');
      return;
    }

    const payload = {
      room:     currentMeta.room,
      time:     currentMeta.time,
      date:     currentMeta.date,
      location: currentMeta.loc,
      name:     $('#fullName').value,
      email:    $('#email').value,
      group:    $('#groupSize').value
    };

    try {
      const resp = await fetch(`${API}/api/reservations`, {
        method:  'POST',
        headers: {'Content-Type':'application/json'},
        body:    JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Booking failed');
      alert('Reservation saved!');
      bg.remove();      // close modal
      chosen.clear();
      loadDay();        // redraw grid (new slot now “busy”)
    } catch (err) {
      alert(err.message);
    }
  });

  // close on backdrop click
  bg.addEventListener('click', e => { if (e.target === bg) bg.remove(); });
}
