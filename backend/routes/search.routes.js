const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const ApiResponse = require('../utils/ApiResponse');
const { optionalAuth } = require('../middleware/auth');

// @desc    Global search across users and posts
// @route   GET /api/v1/search?q=react&type=users|posts|all
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;
    if (!q) return ApiResponse.success(res, { users: [], posts: [] });

    const skip = (page - 1) * limit;
    const results = {};

    if (type === 'users' || type === 'all') {
      results.users = await User.find(
        { $text: { $search: q }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name username avatar headline skills followersCount');
    }

    if (type === 'posts' || type === 'all') {
      results.posts = await Post.find(
        { $text: { $search: q }, visibility: 'public' },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name username avatar');
    }

    return ApiResponse.success(res, results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
