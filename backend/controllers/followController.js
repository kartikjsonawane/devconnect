const Follow = require('../models/Follow');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

exports.followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) throw ApiError.badRequest('Cannot follow yourself');

  const targetUser = await User.findById(userId);
  if (!targetUser) throw ApiError.notFound('User not found');

  const existingFollow = await Follow.findOne({ follower: req.user._id, following: userId });
  if (existingFollow) throw ApiError.conflict('Already following this user');

  await Follow.create({ follower: req.user._id, following: userId });

  await Promise.all([
    User.findByIdAndUpdate(userId, { $addToSet: { followers: req.user._id }, $inc: { followersCount: 1 } }),
    User.findByIdAndUpdate(req.user._id, { $addToSet: { following: userId }, $inc: { followingCount: 1 } }),
  ]);

  notificationService.notifyFollow(req.user._id, userId);

  return ApiResponse.success(res, { isFollowing: true }, 'User followed successfully');
});

exports.unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const follow = await Follow.findOneAndDelete({ follower: req.user._id, following: userId });
  if (!follow) throw ApiError.notFound('Not following this user');

  await Promise.all([
    User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id }, $inc: { followersCount: -1 } }),
    User.findByIdAndUpdate(req.user._id, { $pull: { following: userId }, $inc: { followingCount: -1 } }),
  ]);

  return ApiResponse.success(res, { isFollowing: false }, 'Unfollowed successfully');
});

exports.getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const follows = await Follow.find({ following: userId })
    .populate('follower', 'name username avatar headline skills followersCount')
    .skip(skip)
    .limit(parseInt(limit));

  const users = follows.map((f) => f.follower);
  const total = await Follow.countDocuments({ following: userId });

  return ApiResponse.success(res, { users, total });
});

exports.getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const follows = await Follow.find({ follower: userId })
    .populate('following', 'name username avatar headline skills followersCount isOnline')
    .skip(skip)
    .limit(parseInt(limit));

  const users = follows.map((f) => f.following);
  const total = await Follow.countDocuments({ follower: userId });

  return ApiResponse.success(res, { users, total });
});
