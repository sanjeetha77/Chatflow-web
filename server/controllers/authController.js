const User = require('../models/User');

// @desc    Login or Register user
// @route   POST /api/auth/login-or-register
const loginUser = async (req, res) => {
    const { username, email } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Please provide a username' });
    }

    try {
        let user = await User.findOne({ username });
        let isNew = false;

        if (!user) {
            // Register if user doesn't exist
            const userData = { username };
            if (email) {
                userData.email = email;
            }
            user = await User.create(userData);
            isNew = true;
        }

        res.status(200).json({ ...user.toObject(), isNew });
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ message: 'Email is already in use by another account' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser };
