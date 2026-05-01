const User = require('../models/User');

// @desc    Login/Register user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: 'Please provide username and email' });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // Register if user doesn't exist
            user = await User.create({ username, email });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser };
