const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser } = require('../controllers/userController');

router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser);

module.exports = router;
