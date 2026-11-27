const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMyMessages,
  replyToMessage,
  updateAppointmentStatus,
  markMessagesRead,
  deleteThreadForMe,
  deleteReplyForMe,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);
router.get("/my", protect, getMyMessages);
router.put("/mark-read", protect, markMessagesRead);
router.post("/:id/reply", protect, replyToMessage);
router.put("/:id/appointment", protect, updateAppointmentStatus);
router.delete("/:id", protect, deleteThreadForMe);
router.delete("/:id/replies/:replyId", protect, deleteReplyForMe);

module.exports = router;
