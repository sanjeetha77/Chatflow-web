const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Get all users with their last message relative to current user
// @route   GET /api/users?currentUserId=xyz
const getUsers = async (req, res) => {
    const { currentUserId } = req.query;
    try {
        const users = await User.find({});
        
        // If currentUserId is provided, fetch last message for each user
        if (currentUserId) {
            const usersWithLastMessage = await Promise.all(users.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: currentUserId, receiverId: user._id },
                        { senderId: user._id, receiverId: currentUserId }
                    ]
                })
                .sort({ timestamp: -1 })
                .lean();

                return {
                    ...user.toObject(),
                    lastMessage: lastMessage ? lastMessage.message : null,
                    lastMessageTime: lastMessage ? lastMessage.timestamp : null
                };
            }));
            return res.status(200).json(usersWithLastMessage);
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user
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

// @desc    Update a user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, bio, profilePic } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            id, 
            { username, email, bio, profilePic },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getUsers, createUser, updateUser };
