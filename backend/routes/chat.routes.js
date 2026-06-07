const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, chatController.getConversations);
router.get('/conversations/:userId/start', protect, chatController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', protect, chatController.getMessages);
router.post('/conversations/:conversationId/messages', protect, chatController.sendMessage);

module.exports = router;
