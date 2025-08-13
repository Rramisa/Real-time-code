const express = require('express');
const router = express.Router();
const { validateSyntax } = require('../controllers/syntaxController');
const { authenticateToken } = require('../helper/authMiddleware');

// Route for syntax validation
router.post('/validate', authenticateToken, validateSyntax);

module.exports = router;

