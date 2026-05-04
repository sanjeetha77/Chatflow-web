const Status = require('../models/Status');
const StatusView = require('../models/StatusView');
const User = require('../models/User');

// @desc    Post a new status
// @route   POST /api/status
const postStatus = async (req, res) => {
    const { userId, content, type, backgroundColor, fontFamily, caption, excludedUsers } = req.body;
    try {
        const newStatus = await Status.create({
            userId,
            content,
            type,
            backgroundColor,
            fontFamily,
            caption,
            excludedUsers: excludedUsers || []
        });
        
        const populatedStatus = await newStatus.populate('userId', 'username profilePic');
        res.status(201).json(populatedStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active statuses (with seen status for the requester)
// @route   GET /api/status
const getStatuses = async (req, res) => {
    const { currentUserId } = req.query;
    try {
        const now = new Date();
        const statuses = await Status.find({ 
            expiresAt: { $gt: now },
            excludedUsers: { $ne: currentUserId } 
        })
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 });
            
        // Get all views by the current user to determine "seen" status
        const myViews = currentUserId 
            ? await StatusView.find({ viewerId: currentUserId }).select('statusId')
            : [];
        const viewedStatusIds = new Set(myViews.map(v => v.statusId.toString()));

        // Group by user
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
                // If it's the same user, we push to allStatuses
                // Since they are sorted by createdAt: -1, the first one encountered is the latest
                groupedStatuses[userId].allStatuses.push(status);
                if (!viewedStatusIds.has(status._id.toString())) {
                    groupedStatuses[userId].hasUnseen = true;
                }
            }
        });

        // We want latestStatus to be the one that determines the group order
        // Sort groups by the createdAt of their latestStatus
        const result = Object.values(groupedStatuses).sort((a, b) => b.latestStatus.createdAt - a.latestStatus.createdAt);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a status as seen
// @route   POST /api/status/view
const markSeen = async (req, res) => {
    const { statusId, viewerId } = req.body;
    try {
        // Use upsert to avoid duplicate view records
        await StatusView.findOneAndUpdate(
            { statusId, viewerId },
            { viewedAt: new Date() },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Status marked as seen' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get viewers for a specific status (for my status)
// @route   GET /api/status/:id/viewers
const getViewers = async (req, res) => {
    try {
        const views = await StatusView.find({ statusId: req.params.id })
            .populate('viewerId', 'username profilePic')
            .sort({ viewedAt: -1 });
        res.status(200).json(views);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a status
// @route   DELETE /api/status/:id
const deleteStatus = async (req, res) => {
    try {
        await Status.findByIdAndDelete(req.params.id);
        // Also delete associated views
        await StatusView.deleteMany({ statusId: req.params.id });
        res.status(200).json({ message: 'Status deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { postStatus, getStatuses, markSeen, getViewers, deleteStatus };
