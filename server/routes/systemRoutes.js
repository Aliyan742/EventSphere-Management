const express = require("express");
const router = express.Router();
const {
  getAnalytics,
  submitFeedback,
  getAllFeedback,
  respondFeedback,
  getMyNotifications,
  togglePublicReviewApproval,
  getPublicVerifiedReviews,
} = require("../controllers/systemController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/analytics", protect, authorize("admin"), getAnalytics);
router.get("/notifications", protect, getMyNotifications);
router.get("/public-reviews", getPublicVerifiedReviews);

router.post("/feedback", submitFeedback);
router.get("/feedback", protect, authorize("admin"), getAllFeedback);
router.put("/feedback/:id", protect, authorize("admin"), respondFeedback);
router.put(
  "/feedback/:id/approve-public",
  protect,
  authorize("admin"),
  togglePublicReviewApproval,
);

module.exports = router;
