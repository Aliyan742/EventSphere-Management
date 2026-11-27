const express = require('express');
const router = express.Router();
const {
  createSession,
  getExpoSessions,
  updateSession,
  deleteSession,
  toggleBookmarkSession,
} = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createSession);
router.get('/expo/:expoId', getExpoSessions);
router
  .route('/:id')
  .put(protect, authorize('admin'), updateSession)
  .delete(protect, authorize('admin'), deleteSession);
router.post('/:id/bookmark', protect, authorize('attendee'), toggleBookmarkSession);

module.exports = router;