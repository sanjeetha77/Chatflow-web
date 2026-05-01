const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, clearMessages } = require('../controllers/messageController');

router.post('/', sendMessage);
router.get('/:userId', getMessages);
router.delete('/:userId', clearMessages);

module.exports = router;
