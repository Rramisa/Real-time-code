const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../helper/authMiddleware');
const {
  sendMessage,
  getFileMessages,
  deleteMessage
} = require('../controllers/messageController');

// All routes require authentication
router.use(authenticateToken);

// Send a message
router.post('/send', sendMessage);

// Get messages for a specific file
router.get('/file/:fileId', getFileMessages);

// These routes are no longer needed for file-based messaging

// Delete a message
router.delete('/:messageId', deleteMessage);

module.exports = router;
