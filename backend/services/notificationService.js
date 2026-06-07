const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../models/Notification');
const logger = require('../utils/logger');

let io;
const setSocketIO = (socketIO) => { io = socketIO; };

const createAndEmit = async ({ recipient, sender, type, post, comment, message }) => {
  try {
    if (recipient.toString() === sender.toString()) return null;

    const notification = await Notification.create({
      recipient, sender, type,
      post: post || null,
      comment: comment || null,
      message,
    });

    const populated = await notification.populate('sender', 'name username avatar');

    if (io) {
      io.to(`user:${recipient}`).emit('notification:new', populated);
    }

    return populated;
  } catch (err) {
    logger.error(`Notification creation failed: ${err.message}`);
    return null;
  }
};

const notifyFollow = (sender, recipient) =>
  createAndEmit({ recipient, sender, type: NOTIFICATION_TYPES.FOLLOW, message: 'started following you' });

const notifyLike = (sender, recipient, postId) =>
  createAndEmit({ recipient, sender, type: NOTIFICATION_TYPES.LIKE, post: postId, message: 'liked your post' });

const notifyComment = (sender, recipient, postId, commentId) =>
  createAndEmit({ recipient, sender, type: NOTIFICATION_TYPES.COMMENT, post: postId, comment: commentId, message: 'commented on your post' });

const notifyConnectionRequest = (sender, recipient) =>
  createAndEmit({ recipient, sender, type: NOTIFICATION_TYPES.CONNECTION_REQUEST, message: 'sent you a connection request' });

const notifyConnectionAccepted = (sender, recipient) =>
  createAndEmit({ recipient, sender, type: NOTIFICATION_TYPES.CONNECTION_ACCEPTED, message: 'accepted your connection request' });

const notifyEndorsement = (sender, recipient, skill) =>
  createAndEmit({ recipient, sender, type: NOTIFICATION_TYPES.ENDORSEMENT, message: `endorsed your skill: ${skill}` });

module.exports = { setSocketIO, notifyFollow, notifyLike, notifyComment, notifyConnectionRequest, notifyConnectionAccepted, notifyEndorsement };
