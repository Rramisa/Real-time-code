const express = require('express');
const { authenticateToken } = require('../helper/authMiddleware');
const { markOnline, markOffline, summary } = require('../controllers/presenceController');

const router = express.Router();

router.post('/presence/online', authenticateToken, markOnline);
router.post('/presence/offline', authenticateToken, markOffline);
router.get('/presence/summary', authenticateToken, summary);

module.exports = router;


