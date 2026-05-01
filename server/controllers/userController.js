const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user (redundant if login registers, but as per requirements)
// @route   POST /api/users
const createUser = async (req, res) => {
    const { username, email } = req.body;
    try {
        const user = await User.create({ username, email });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getUsers, createUser };
