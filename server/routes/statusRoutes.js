const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

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

const { postStatus, getStatuses, markSeen, getViewers, deleteStatus } = require('../controllers/statusController');

router.post('/', postStatus);
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.status(200).json({ url: `/uploads/${req.file.filename}` });
});
router.get('/', getStatuses);
router.post('/view', markSeen);
router.get('/:id/viewers', getViewers);
router.delete('/:id', deleteStatus);

module.exports = router;
