const express = require('express');
const router = express.Router();
const {
  createExpo,
  getAllExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
  registerAttendeeForExpo,
} = require('../controllers/expoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getAllExpos)
  .post(protect, authorize('admin'), createExpo);

router
  .route('/:id')
  .get(getExpoById)
  .put(protect, authorize('admin'), updateExpo)
  .delete(protect, authorize('admin'), deleteExpo);

router.post('/:id/register', protect, authorize('attendee'), registerAttendeeForExpo);

module.exports = router;