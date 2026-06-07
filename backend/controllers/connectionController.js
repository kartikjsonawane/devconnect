const ConnectionRequest = require('../models/ConnectionRequest');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

exports.sendRequest = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;
  if (receiverId === req.user._id.toString()) throw ApiError.badRequest('Cannot connect with yourself');

  const existing = await ConnectionRequest.findOne({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id },
    ],
  });

  if (existing) {
    if (existing.status === 'accepted') throw ApiError.conflict('Already connected');
    if (existing.status === 'pending') throw ApiError.conflict('Request already pending');
  }

  const request = await ConnectionRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    message,
  });

  notificationService.notifyConnectionRequest(req.user._id, receiverId);

  return ApiResponse.created(res, { request }, 'Connection request sent');
});

exports.respondToRequest = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'accept' | 'reject'
  const request = await ConnectionRequest.findOne({
    _id: req.params.requestId,
    receiver: req.user._id,
    status: 'pending',
  });

  if (!request) throw ApiError.notFound('Connection request not found');

  request.status = action === 'accept' ? 'accepted' : 'rejected';
  await request.save();

  if (action === 'accept') {
    notificationService.notifyConnectionAccepted(req.user._id, request.sender);
  }

  return ApiResponse.success(res, { request }, `Request ${request.status}`);
});

exports.getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await ConnectionRequest.find({
    receiver: req.user._id,
    status: 'pending',
  }).populate('sender', 'name username avatar headline skills');

  return ApiResponse.success(res, { requests, total: requests.length });
});

exports.getConnections = asyncHandler(async (req, res) => {
  const connections = await ConnectionRequest.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    status: 'accepted',
  })
    .populate('sender', 'name username avatar headline isOnline')
    .populate('receiver', 'name username avatar headline isOnline');

  const users = connections.map((c) => {
    const other = c.sender._id.toString() === req.user._id.toString() ? c.receiver : c.sender;
    return other;
  });

  return ApiResponse.success(res, { connections: users, total: users.length });
});
