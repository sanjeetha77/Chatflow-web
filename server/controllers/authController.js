const userService = require('../services/userService');

// @desc    Login or Register user
// @route   POST /api/auth/login-or-register
const loginUser = async (req, res, next) => {
    const { username, email } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Please provide a username' });
    }

    try {
        const { user, isNew } = await userService.loginOrRegister(username, email);

        req.app.get('io').emit('user:joined', user);

        res.status(200).json({ ...user, isNew });
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            res.status(400);
            return next(new Error('Email is already in use by another account'));
        }
        next(error);
    }
};

module.exports = { loginUser };
