const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../helper/authMiddleware');
const { getPreferences, upsertPreferences } = require('../controllers/preferenceController');

router.use(authenticateToken);
router.get('/', getPreferences);
router.put('/', upsertPreferences);

module.exports = router;


