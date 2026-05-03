const express = require('express');
const router = express.Router();
const { 
    sendMessage, 
    getMessages, 
    clearMessages, 
    deleteMessage, 
    forwardMessage, 
    toggleStar, 
    togglePin,
    reactToMessage 
} = require('../controllers/messageController');

router.post('/', sendMessage);
router.post('/forward', forwardMessage);
router.get('/:userId', getMessages);
router.delete('/:userId', clearMessages);
router.delete('/single/:messageId', deleteMessage);
router.patch('/star/:messageId', toggleStar);
router.patch('/pin/:messageId', togglePin);
router.patch('/react/:messageId', reactToMessage);

module.exports = router;
