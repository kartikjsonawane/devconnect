const Comment = require('../models/Comment');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

exports.getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ post: postId, parentComment: null })
      .populate('author', 'name username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Comment.countDocuments({ post: postId, parentComment: null }),
  ]);

  return ApiResponse.success(res, { comments, total });
});

exports.createComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found');

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content,
    parentComment: parentComment || null,
  });

  // Update counts
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, { $inc: { repliesCount: 1 }, $push: { replies: comment._id } });
  }

  const populated = await comment.populate('author', 'name username avatar');

  // Notify post author
  notificationService.notifyComment(req.user._id, post.author, postId, comment._id);

  // Emit real-time
  const { io } = require('../server');
  if (io) {
    io.to(`post:${postId}`).emit('comment:new', populated);
  }

  return ApiResponse.created(res, { comment: populated });
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  await Promise.all([
    comment.deleteOne(),
    Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } }),
    comment.parentComment ? Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } }) : Promise.resolve(),
  ]);

  return ApiResponse.success(res, null, 'Comment deleted');
});
