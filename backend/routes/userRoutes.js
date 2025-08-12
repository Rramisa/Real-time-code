const express = require('express');
const { authenticateToken } = require('../helper/authMiddleware');
const { getProfile, updateProfile, deleteUser, listUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/user/profile', authenticateToken, getProfile);
router.put('/user/profile', authenticateToken, updateProfile);

// Admin/dev routes
router.delete('/admin/delete-user/:userId', deleteUser);
router.get('/admin/users', listUsers);

module.exports = router;

