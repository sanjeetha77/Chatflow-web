const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

router.post('/login-or-register', loginUser);

module.exports = router;
