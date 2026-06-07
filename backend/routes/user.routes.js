const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadAvatar, uploadPostImage } = require('../config/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.get('/search', optionalAuth, userController.searchUsers);
router.get('/trending', userController.getTrendingDevelopers);
router.get('/recommended', protect, userController.getRecommendedConnections);
router.get('/me/analytics', protect, userController.getProfileAnalytics);
router.put('/me', protect, userController.updateProfile);
router.post('/me/avatar', protect, uploadLimiter, uploadAvatar.single('avatar'), userController.uploadAvatar);
router.get('/github/:username', userController.getGitHubData);
router.post('/:userId/endorse/:skill', protect, userController.endorseSkill);
router.get('/:username', optionalAuth, userController.getUserProfile);

module.exports = router;
