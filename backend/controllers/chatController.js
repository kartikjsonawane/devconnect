const { Conversation, Message } = require('../models/Message');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId], $size: 2 },
  }).populate('participants', 'name username avatar isOnline');

  if (!conversation) {
    conversation = await Conversation.create({ participants: [req.user._id, userId] });
    await conversation.populate('participants', 'name username avatar isOnline');
  }

  return ApiResponse.success(res, { conversation });
});

exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name username avatar isOnline lastSeen')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

  return ApiResponse.success(res, { conversations });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 30 } = req.query;
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(req.user._id)) {
    throw ApiError.forbidden('Not a participant of this conversation');
  }

  const messages = await Message.find({ conversation: conversationId, isDeleted: false })
    .populate('sender', 'name username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return ApiResponse.success(res, { messages: messages.reverse() });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, messageType = 'text' } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(req.user._id)) {
    throw ApiError.forbidden('Not a participant');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    content,
    messageType,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
  });

  const populated = await message.populate('sender', 'name username avatar');

  // Emit via Socket.io
  const { io } = require('../server');
  if (io) {
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== req.user._id.toString()) {
        io.to(`user:${participantId}`).emit('message:new', { conversationId, message: populated });
      }
    });
  }

  return ApiResponse.created(res, { message: populated });
});
