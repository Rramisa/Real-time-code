const express = require('express');
const { register, login, resetPassword, verifySecurityQuestions, resetPasswordConfirm } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/verify-security-questions', verifySecurityQuestions);
router.post('/reset-password-confirm', resetPasswordConfirm);

module.exports = router;

