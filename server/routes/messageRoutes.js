const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const { 
    sendMessage, 
    getMessages, 
    clearMessages, 
    deleteMessage, 
    forwardMessage, 
    toggleStar, 
    togglePin,
    reactToMessage,
    uploadFile
} = require('../controllers/messageController');

router.post('/', sendMessage);
router.post('/upload', upload.single('file'), uploadFile);
router.post('/forward', forwardMessage);
router.get('/:userId', getMessages);
router.delete('/:userId', clearMessages);
router.delete('/single/:messageId', deleteMessage);
router.patch('/star/:messageId', toggleStar);
router.patch('/pin/:messageId', togglePin);
router.patch('/react/:messageId', reactToMessage);

module.exports = router;
