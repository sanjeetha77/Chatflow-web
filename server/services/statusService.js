const Status = require('../models/Status');
const StatusView = require('../models/StatusView');

const createStatus = async (statusData) => {
    const newStatus = await Status.create(statusData);
    return await newStatus.populate('userId', 'username profilePic');
};

const getActiveStatuses = async (currentUserId) => {
    const now = new Date();
    const statuses = await Status.find({ 
        expiresAt: { $gt: now },
        excludedUsers: { $ne: currentUserId } 
    })
        .populate('userId', 'username profilePic')
        .sort({ createdAt: -1 });
        
    const myViews = currentUserId 
        ? await StatusView.find({ viewerId: currentUserId }).select('statusId')
        : [];
    const viewedStatusIds = new Set(myViews.map(v => v.statusId.toString()));

    const groupedStatuses = {};
    statuses.forEach(status => {
        const userId = status.userId._id.toString();
        if (!groupedStatuses[userId]) {
            groupedStatuses[userId] = {
                user: status.userId,
                latestStatus: status,
                allStatuses: [status],
                hasUnseen: !viewedStatusIds.has(status._id.toString())
            };
        } else {
            groupedStatuses[userId].allStatuses.push(status);
            if (!viewedStatusIds.has(status._id.toString())) {
                groupedStatuses[userId].hasUnseen = true;
            }
        }
    });

    return Object.values(groupedStatuses).sort((a, b) => b.latestStatus.createdAt - a.latestStatus.createdAt);
};

const markStatusAsSeen = async (statusId, viewerId) => {
    return await StatusView.findOneAndUpdate(
        { statusId, viewerId },
        { viewedAt: new Date() },
        { upsert: true, new: true }
    );
};

const getStatusViewers = async (statusId) => {
    return await StatusView.find({ statusId })
        .populate('viewerId', 'username profilePic')
        .sort({ viewedAt: -1 });
};

const deleteStatusById = async (statusId) => {
    await Status.findByIdAndDelete(statusId);
    await StatusView.deleteMany({ statusId });
};

module.exports = {
    createStatus,
    getActiveStatuses,
    markStatusAsSeen,
    getStatusViewers,
    deleteStatusById
};
