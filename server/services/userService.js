const User = require('../models/User');
const Message = require('../models/Message');

const loginOrRegister = async (username, email) => {
    let user = await User.findOne({ username });
    let isNew = false;

    if (!user) {
        const userData = { username };
        if (email) {
            userData.email = email;
        }
        user = await User.create(userData);
        isNew = true;
    }

    return { user: user.toObject(), isNew };
};

const getAllUsersWithLastMessage = async (currentUserId) => {
    const users = await User.find({});
    
    if (!currentUserId) {
        return users;
    }

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

    return usersWithLastMessage;
};

const createUser = async (userData) => {
    return await User.create(userData);
};

const updateUser = async (id, updateData) => {
    const user = await User.findByIdAndUpdate(
        id, 
        updateData,
        { new: true, runValidators: true }
    );
    return user;
};

module.exports = {
    loginOrRegister,
    getAllUsersWithLastMessage,
    createUser,
    updateUser
};
