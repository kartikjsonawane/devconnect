const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const skip = (page - 1) * limit;

  const filter = { recipient: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name username avatar')
      .populate('post', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    Notification.countDocuments(filter),
  ]);

  return ApiResponse.success(res, { notifications, unreadCount, total });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (notificationIds) {
    await Notification.updateMany(
      { _id: { $in: notificationIds }, recipient: req.user._id },
      { $set: { isRead: true, readAt: new Date() } }
    );
  } else {
    // Mark all as read
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }

  return ApiResponse.success(res, null, 'Notifications marked as read');
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  return ApiResponse.success(res, null, 'Notification deleted');
});
