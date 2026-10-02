const express = require('express');
const { getPublicKey, subscribe, unsubscribe, sendTest } = require('../controllers/pushController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All push routes are for logged-in admins only
router.use(protect);

router.get('/public-key', getPublicKey);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/test', sendTest);

module.exports = router;
