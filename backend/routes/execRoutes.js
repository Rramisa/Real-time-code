const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/execController');
const { authenticateToken } = require('../helper/authMiddleware');

router.post('/run', authenticateToken, executeCode);

module.exports = router;


