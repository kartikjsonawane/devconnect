const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

router.post('/request', protect, connectionController.sendRequest);
router.put('/request/:requestId', protect, connectionController.respondToRequest);
router.get('/requests/pending', protect, connectionController.getPendingRequests);
router.get('/', protect, connectionController.getConnections);

module.exports = router;
