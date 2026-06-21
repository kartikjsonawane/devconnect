const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { fetchGitHubProfile, fetchGitHubRepos } = require('../services/githubService');
const notificationService = require('../services/notificationService');

const SAFE_USER_FIELDS = 'name username avatar bio headline location website githubUsername twitterHandle linkedinUrl skills techStack openToWork yearsOfExperience experience projects followers following followersCount followingCount postsCount isOnline lastSeen createdAt endorsements';

exports.getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).select(SAFE_USER_FIELDS);
  if (!user) throw ApiError.notFound('User not found');

  // Increment profile views (fire-and-forget)
  User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1, profileViewsThisWeek: 1 } }).exec();

  let isFollowing = false;
  let isConnected = false;
  if (req.user) {
    isFollowing = user.followers.some((f) => f.toString() === req.user._id.toString());
  }

  return ApiResponse.success(res, { user, isFollowing });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'bio', 'headline', 'location', 'website', 'githubUsername',
    'twitterHandle', 'linkedinUrl', 'skills', 'techStack', 'openToWork',
    'yearsOfExperience', 'experience', 'projects'];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select(SAFE_USER_FIELDS);

  return ApiResponse.success(res, { user }, 'Profile updated successfully');
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');

  const user = await User.findById(req.user._id).select('+avatarPublicId');

  // Delete old avatar from Cloudinary
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  user.avatar = req.file.path;
  user.avatarPublicId = req.file.filename;
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, { avatar: user.avatar }, 'Avatar uploaded successfully');
});

exports.searchUsers = asyncHandler(async (req, res) => {
  const { q, skills, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { isActive: true };

  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { name: regex },
      { username: regex },
      { headline: regex },
      { bio: regex },
      { 'skills.name': regex },
    ];
  }

  if (skills) {
    const skillsArray = skills.split(',').map((s) => s.trim().toLowerCase());
    query['skills.name'] = { $in: skillsArray };
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name username avatar headline skills followersCount openToWork isOnline')
      .sort({ followersCount: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return ApiResponse.success(res, {
    users,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
  });
});

exports.getTrendingDevelopers = asyncHandler(async (req, res) => {
  // Algorithm: followers + recent posts engagement + profile completeness
  const users = await User.aggregate([
    { $match: { isActive: true } },
    {
      $addFields: {
        trendScore: {
          $add: [
            { $multiply: ['$followersCount', 2] },
            { $multiply: ['$postsCount', 5] },
            { $cond: ['$githubUsername', 10, 0] },
            { $cond: ['$openToWork', 5, 0] },
            { $size: { $ifNull: ['$skills', []] } },
          ],
        },
      },
    },
    { $sort: { trendScore: -1 } },
    { $limit: 10 },
    {
      $project: {
        name: 1, username: 1, avatar: 1, headline: 1,
        skills: { $slice: ['$skills', 5] },
        followersCount: 1, openToWork: 1, isOnline: 1, trendScore: 1,
      },
    },
  ]);

  return ApiResponse.success(res, { users });
});

exports.getRecommendedConnections = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select('skills following followers');

  // Recommend users with overlapping skills not already followed
  const alreadyFollowing = currentUser.following.map((id) => id.toString());
  alreadyFollowing.push(req.user._id.toString());

  const users = await User.find({
    _id: { $nin: alreadyFollowing },
    skills: { $in: currentUser.skills },
    isActive: true,
  })
    .select('name username avatar headline skills followersCount openToWork')
    .sort({ followersCount: -1 })
    .limit(10);

  return ApiResponse.success(res, { users });
});

exports.getGitHubData = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const [profile, repos] = await Promise.all([
    fetchGitHubProfile(username),
    fetchGitHubRepos(username),
  ]);

  const safeRepos = repos.map((r) => ({
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    url: r.html_url,
  }));

  return ApiResponse.success(res, { profile, repos: safeRepos });
});

exports.endorseSkill = asyncHandler(async (req, res) => {
  const { userId, skill } = req.params;
  if (userId === req.user._id.toString()) throw ApiError.badRequest('Cannot endorse yourself');

  const targetUser = await User.findById(userId);
  if (!targetUser) throw ApiError.notFound('User not found');

  if (!targetUser.skills.includes(skill)) throw ApiError.badRequest('Skill not found on user profile');

  const endorsements = targetUser.endorsements || new Map();
  const skillEndorsers = endorsements.get(skill) || [];

  const alreadyEndorsed = skillEndorsers.some((id) => id.toString() === req.user._id.toString());
  if (alreadyEndorsed) throw ApiError.conflict('You have already endorsed this skill');

  skillEndorsers.push(req.user._id);
  endorsements.set(skill, skillEndorsers);
  targetUser.endorsements = endorsements;
  await targetUser.save({ validateBeforeSave: false });

  notificationService.notifyEndorsement(req.user._id, userId, skill);

  return ApiResponse.success(res, { endorsementsCount: skillEndorsers.length }, 'Skill endorsed');
});

exports.getProfileAnalytics = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('profileViews profileViewsThisWeek followersCount postsCount');

  const postStats = await Post.aggregate([
    { $match: { author: req.user._id } },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: '$likesCount' },
        totalComments: { $sum: '$commentsCount' },
        avgEngagement: { $avg: '$engagementScore' },
      },
    },
  ]);

  return ApiResponse.success(res, {
    profileViews: user.profileViews,
    profileViewsThisWeek: user.profileViewsThisWeek,
    followersCount: user.followersCount,
    postsCount: user.postsCount,
    ...(postStats[0] || { totalLikes: 0, totalComments: 0, avgEngagement: 0 }),
  });
});
