const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPostImage } = require('../config/cloudinary');

router.get('/feed', protect, postController.getFeed);
router.get('/explore', optionalAuth, postController.getExplorePosts);
router.get('/bookmarks', protect, postController.getBookmarks);
router.get('/user/:username', optionalAuth, postController.getUserPosts);
router.post('/', protect, uploadPostImage.array('images', 4), postController.createPost);
router.get('/:postId', optionalAuth, postController.getPost);
router.put('/:postId', protect, postController.updatePost);
router.delete('/:postId', protect, postController.deletePost);
router.post('/:postId/like', protect, postController.toggleLike);
router.post('/:postId/bookmark', protect, postController.bookmarkPost);

// Comments
router.get('/:postId/comments', optionalAuth, commentController.getComments);
router.post('/:postId/comments', protect, commentController.createComment);
router.delete('/:postId/comments/:commentId', protect, commentController.deleteComment);

module.exports = router;
