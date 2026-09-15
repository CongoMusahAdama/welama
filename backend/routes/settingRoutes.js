const express = require('express');
const router = express.Router();
const { getSettings, getAdminSettings, updateSettings, testSms } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.get('/admin', protect, getAdminSettings);
router.put('/', protect, updateSettings);
router.post('/test-sms', protect, testSms);

module.exports = router;
