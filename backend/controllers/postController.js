const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

exports.createPost = asyncHandler(async (req, res) => {
  const { content, tags, codeSnippet, visibility } = req.body;

  const images = req.files?.map((f) => ({ url: f.path, publicId: f.filename })) || [];

  const post = await Post.create({
    author: req.user._id,
    content,
    images,
    tags: tags ? tags.split(',').map((t) => t.trim().toLowerCase()) : [],
    codeSnippet,
    visibility: visibility || 'public',
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

  const populated = await Post.findById(post._id).populate('author', 'name username avatar headline');

  // Emit to followers via socket
  const { io } = require('../server');
  if (io) {
    io.to(`followers:${req.user._id}`).emit('post:new', populated);
  }

  return ApiResponse.created(res, { post: populated }, 'Post created successfully');
});

exports.getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Get IDs of users the current user follows + self
  const following = await Follow.find({ follower: req.user._id }).select('following');
  const followingIds = following.map((f) => f.following);
  followingIds.push(req.user._id);

  const [posts, total] = await Promise.all([
    Post.find({
      author: { $in: followingIds },
      visibility: { $in: ['public', 'followers'] },
    })
      .populate('author', 'name username avatar headline isOnline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Post.countDocuments({ author: { $in: followingIds } }),
  ]);

  // Add isLiked flag
  const postsWithMeta = posts.map((post) => ({
    ...post,
    isLiked: post.likes.some((id) => id.toString() === req.user._id.toString()),
    isBookmarked: req.user.bookmarks?.includes(post._id.toString()),
  }));

  return ApiResponse.success(res, {
    posts: postsWithMeta,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit), hasMore: skip + posts.length < total },
  });
});

exports.getExplorePosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tag } = req.query;
  const skip = (page - 1) * limit;

  const filter = { visibility: 'public' };
  if (tag) filter.tags = tag.toLowerCase();

  const posts = await Post.find(filter)
    .populate('author', 'name username avatar headline')
    .sort({ engagementScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return ApiResponse.success(res, { posts });
});

exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId)
    .populate('author', 'name username avatar headline');
  if (!post) throw ApiError.notFound('Post not found');

  const isLiked = req.user ? post.likes.some((id) => id.toString() === req.user._id.toString()) : false;

  return ApiResponse.success(res, { post, isLiked });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (post.author.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not authorized');

  const { content, tags, visibility } = req.body;
  if (content) post.content = content;
  if (tags) post.tags = tags.split(',').map((t) => t.trim().toLowerCase());
  if (visibility) post.visibility = visibility;
  post.isEdited = true;
  post.editedAt = new Date();

  await post.save();
  await post.populate('author', 'name username avatar headline');

  return ApiResponse.success(res, { post }, 'Post updated');
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  await Promise.all([
    post.deleteOne(),
    Comment.deleteMany({ post: post._id }),
    User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } }),
  ]);

  return ApiResponse.success(res, null, 'Post deleted');
});

exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');

  const userId = req.user._id;
  const isLiked = post.likes.some((id) => id.toString() === userId.toString());

  if (isLiked) {
    post.likes.pull(userId);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likes.push(userId);
    post.likesCount += 1;
    notificationService.notifyLike(userId, post.author, post._id);
  }

  await post.save();

  // Emit real-time update
  const { io } = require('../server');
  if (io) {
    io.to(`post:${post._id}`).emit('post:liked', {
      postId: post._id,
      likesCount: post.likesCount,
      userId,
      action: isLiked ? 'unlike' : 'like',
    });
  }

  return ApiResponse.success(res, { isLiked: !isLiked, likesCount: post.likesCount });
});

exports.getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ username });
  if (!user) throw ApiError.notFound('User not found');

  const filter = { author: user._id };
  if (!req.user || req.user._id.toString() !== user._id.toString()) {
    filter.visibility = 'public';
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name username avatar headline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Post.countDocuments(filter),
  ]);

  return ApiResponse.success(res, {
    posts,
    pagination: { total, page: parseInt(page), hasMore: skip + posts.length < total },
  });
});

exports.bookmarkPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');

  const user = await User.findById(req.user._id);
  const isBookmarked = user.bookmarks.includes(req.params.postId);

  if (isBookmarked) {
    user.bookmarks.pull(req.params.postId);
    post.bookmarkCount = Math.max(0, post.bookmarkCount - 1);
  } else {
    user.bookmarks.push(req.params.postId);
    post.bookmarkCount += 1;
  }

  await Promise.all([user.save({ validateBeforeSave: false }), post.save()]);

  return ApiResponse.success(res, { isBookmarked: !isBookmarked }, isBookmarked ? 'Removed from bookmarks' : 'Post bookmarked');
});

exports.getBookmarks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user._id).select('bookmarks');
  const bookmarkIds = user.bookmarks.slice(skip, skip + parseInt(limit));

  const posts = await Post.find({ _id: { $in: bookmarkIds } })
    .populate('author', 'name username avatar headline');

  return ApiResponse.success(res, { posts, total: user.bookmarks.length });
});
