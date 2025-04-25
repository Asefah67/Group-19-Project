const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const GROUPS_FILE = path.join(__dirname, 'groups.json');

function readGroups() {
  const data = fs.readFileSync(GROUPS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeGroups(groupsData) {
  fs.writeFileSync(GROUPS_FILE, JSON.stringify(groupsData, null, 2));
}

router.get('/groups', (req, res) => {
  const data = readGroups();
  res.json(data.groups);
});

router.post('/create-group', (req, res) => {
  const { className, groupName } = req.body;

  if (!className || !groupName) {
    return res.status(400).json({ error: 'Missing className or groupName' });
  }

  const data = readGroups();
  data.groups.push({
    className,
    groupName,
    members: [],
    status: false
  });

  writeGroups(data);
  res.status(201).json({ message: 'Group created successfully' });
});

router.post('/join-group', (req, res) => {
  const { className, groupName, username } = req.body;

  if (!className || !groupName || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const data = readGroups();
  const group = data.groups.find(g => g.className === className && g.groupName === groupName);

  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (!group.members.includes(username)) {
    group.members.push(username);
    writeGroups(data);
    return res.status(200).json({ message: 'User added to group' });
  }

  res.status(200).json({ message: 'User already a member of the group' });
});

module.exports = router;