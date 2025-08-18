const User = require('../models/User');

// Simple in-memory presence store
// Map<userIdString, Date>
const onlineUsers = new Map();

async function markOnline(req, res) {
  try {
    const userId = String(req.user._id);
    onlineUsers.set(userId, new Date());
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function markOffline(req, res) {
  try {
    const userId = String(req.user._id);
    onlineUsers.delete(userId);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// Return online and offline users (by username/email minimal fields)
async function summary(req, res) {
  try {
    const users = await User.find({}).select('username email');
    const result = { online: [], offline: [] };
    const onlineSet = new Set(onlineUsers.keys());
    users.forEach((u) => {
      const id = String(u._id);
      const item = { id, username: u.username, email: u.email };
      if (onlineSet.has(id)) {
        result.online.push(item);
      } else {
        result.offline.push(item);
      }
    });
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  markOnline,
  markOffline,
  summary,
};


