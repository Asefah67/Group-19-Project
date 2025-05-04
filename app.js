// app.js
const express = require('express');
const path = require('path');
const app = express();

// 🔁 Routes for your group feature
const groupRoutes = require('./create-group/group-data-logic');

app.use(express.json());

// ✅ Serve your group's frontend (Study Group)
app.use('/create-group', express.static(path.join(__dirname, 'create-group')));

// ✅ Serve Canvas landing + other pages
app.use(express.static(path.join(__dirname, 'Landing Page')));

// ✅ Your backend API routes
app.use('/', groupRoutes);

// ✅ Set landing page (Canvas) as root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Landing Page', 'Canvas-Layout.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
