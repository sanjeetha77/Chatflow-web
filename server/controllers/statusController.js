const statusService = require('../services/statusService');

// @desc    Post a new status
// @route   POST /api/status
const postStatus = async (req, res, next) => {
    const { userId, content, type, backgroundColor, fontFamily, caption, excludedUsers } = req.body;
    try {
        const status = await statusService.createStatus({
            userId,
            content,
            type,
            backgroundColor,
            fontFamily,
            caption,
            excludedUsers: excludedUsers || []
        });
        res.status(201).json(status);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active statuses (with seen status for the requester)
// @route   GET /api/status
const getStatuses = async (req, res, next) => {
    const { currentUserId } = req.query;
    try {
        const result = await statusService.getActiveStatuses(currentUserId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a status as seen
// @route   POST /api/status/view
const markSeen = async (req, res, next) => {
    const { statusId, viewerId } = req.body;
    try {
        await statusService.markStatusAsSeen(statusId, viewerId);
        res.status(200).json({ message: 'Status marked as seen' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get viewers for a specific status (for my status)
// @route   GET /api/status/:id/viewers
const getViewers = async (req, res, next) => {
    try {
        const views = await statusService.getStatusViewers(req.params.id);
        res.status(200).json(views);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a status
// @route   DELETE /api/status/:id
const deleteStatus = async (req, res, next) => {
    try {
        await statusService.deleteStatusById(req.params.id);
        res.status(200).json({ message: 'Status deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { postStatus, getStatuses, markSeen, getViewers, deleteStatus };
