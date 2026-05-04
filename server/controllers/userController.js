const userService = require('../services/userService');

// @desc    Get all users with their last message relative to current user
// @route   GET /api/users?currentUserId=xyz
const getUsers = async (req, res, next) => {
    const { currentUserId } = req.query;
    try {
        const users = await userService.getAllUsersWithLastMessage(currentUserId);
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a user
// @route   POST /api/users
const createUser = async (req, res, next) => {
    const { username, email } = req.body;
    try {
        const user = await userService.createUser({ username, email });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { username, email, bio, profilePic } = req.body;
    try {
        const user = await userService.updateUser(id, { username, email, bio, profilePic });
        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsers, createUser, updateUser };
