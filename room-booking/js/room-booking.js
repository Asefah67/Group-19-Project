/* ========= tiny helper ========= */
const $ = sel => document.querySelector(sel);

/* ========= IndexedDB setup ========= */
let db;
indexedDB.open('studyBuddy', 1).onupgradeneeded = e => {
  db = e.target.result;
  if (!db.objectStoreNames.contains('reservations')) {
    db.createObjectStore('reservations', { keyPath:'id', autoIncrement:true });
  }
};
indexedDB.open('studyBuddy', 1).onsuccess = e => { db = e.target.result; };

/* ========= state ========= */
const chosen = new Set();   // “room|time”
let currentMeta = {};       // { room,time,date,loc }

/* ========= on‐load & “Search” button ========= */
window.addEventListener('DOMContentLoaded', loadGrid);
$('#searchBtn').addEventListener('click', loadGrid);

async function loadGrid () {
  // clear previous
  $('#gridWrapper').innerHTML = '';
  $('#selectionList').innerHTML = '';
  chosen.clear();
  $('#confirmBtn').disabled = true;

  // header
  const dateVal = $('#dateSel').value;
  $('#dateHeading').textContent = new Date(dateVal).toDateString();

  // fetch data
  const loc  = $('#locationSel').value || 'du-bois';
  const resp = await fetch(`http://localhost:3000/api/rooms?location=${loc}&date=${dateVal}`);
  if (!resp.ok) {
    alert('No data for that date/location');
    return;
  }
  const data = await resp.json();
  drawGrid(data);
}

/* ========= build the grid ========= */
function drawGrid (data) {
  const times = [
    '7:00','7:30','8:00','8:30','9:00','9:30',
    '10:00','10:30','11:00','11:30','12:00','12:30','13:00'
  ];

  const wrap = $('#gridWrapper');
  const g = document.createElement('div');
  g.className = 'slot-grid';
  g.style.gridTemplateColumns = `200px repeat(${times.length},50px)`;

  // top‐left spacer
  g.appendChild(document.createElement('div'));

  // time headers
  times.forEach(t => {
    const h = document.createElement('div');
    h.className = 'slot-head';
    h.textContent = t;
    g.appendChild(h);
  });

  // one row per room
  data.rooms.forEach((r, idx) => {
    // room label
    const lbl = document.createElement('div');
    lbl.className = 'slot-room';
    lbl.textContent = `${r.name} (Cap ${r.cap})`;
    g.appendChild(lbl);

    // each timeslot
    times.forEach(t => {
      const cell = document.createElement('div');
      const status = (data.slots[idx][t] === 'busy') ? 'busy' : 'free';
      cell.className = `slot-cell ${status}`;
      cell.dataset.room = r.name;
      cell.dataset.time = t;
      if (status === 'free') {
        cell.addEventListener('click', () => toggle(cell));
      }
      g.appendChild(cell);
    });
  });

  wrap.appendChild(g);
}

/* ========= selection UX ========= */
function toggle (cell) {
  const key = cell.dataset.room + '|' + cell.dataset.time;
  if (chosen.has(key)) {
    chosen.delete(key);
    cell.classList.remove('chosen');
  } else {
    // only one selection at a time
    document.querySelectorAll('.chosen').forEach(c => c.classList.remove('chosen'));
    chosen.clear();
    chosen.add(key);
    cell.classList.add('chosen');
  }
  renderSelection();
}

function renderSelection () {
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
    loc : $('#locationSel').value || 'du-bois'
  };

  const li = document.createElement('li');
  li.textContent = `${room} – ${time}`;
  const trash = document.createElement('span');
  trash.textContent = ' 🗑';
  trash.className = 'trash';
  trash.addEventListener('click', () => {
    chosen.clear();
    renderSelection();
  });
  li.appendChild(trash);
  list.appendChild(li);

  $('#confirmBtn').disabled = false;
}

/* ========= confirmation modal ========= */
$('#confirmBtn').addEventListener('click', openConfirmation);

function openConfirmation () {
  // backdrop
  const bg = document.createElement('div');
  bg.style.cssText = 'position:fixed;inset:0;background:#0008;display:flex;align-items:center;justify-content:center;z-index:99';

  // dialog
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;padding:2rem 2.5rem;border-radius:6px;max-width:420px;width:100%';
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
        <option value="">Select…</option><option>3-5</option><option>More than 5</option>
      </select>
    </label><br><br>

    <button id="submitBtn" style="padding:.5rem 1rem;background:#26a65b;color:#fff;border:none;border-radius:4px">
      Submit my Booking
    </button>
  `;
  bg.appendChild(box);
  document.body.appendChild(bg);

  // form submit
  $('#submitBtn').addEventListener('click', async () => {
    const name  = $('#fullName').value.trim();
    const email = $('#email').value.trim();
    const group = $('#groupSize').value;
    if (!name || !email.endsWith('@umass.edu') || !group) {
      return alert('Please fill out every required field.');
    }

    // 1) POST to Express back-end
    await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        location: currentMeta.loc,
        date    : currentMeta.date,
        room    : currentMeta.room,
        time    : currentMeta.time,
        name,
        email,
        group
      })
    });

    // 2) also keep local copy in IndexedDB
    const tx = db.transaction('reservations','readwrite')
                 .objectStore('reservations')
                 .add({
                   ...currentMeta,
                   name,
                   email,
                   group
                 });
    tx.oncomplete = () => {
      alert('Reservation stored (server + local)');
      bg.remove();
      chosen.clear();
      renderSelection();
    };
  });

  // close if click outside dialog
  bg.addEventListener('click', e => {
    if (e.target === bg) bg.remove();
  });
}
