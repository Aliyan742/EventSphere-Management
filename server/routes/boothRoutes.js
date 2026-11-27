const express = require('express');
const router = express.Router();
const {
  reserveBooth,
  updateBoothApproval,
  updateBoothShowcase,
  getExpoBooths,
} = require('../controllers/boothController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/expo/:expoId', getExpoBooths);
router.post('/:id/reserve', protect, authorize('exhibitor'), reserveBooth);
router.put('/:id/status', protect, authorize('admin'), updateBoothApproval);
router.put('/:id/showcase', protect, authorize('exhibitor'), updateBoothShowcase);

module.exports = router;