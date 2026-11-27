const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteMyAccount,
  changePassword,
  toggleSavedBooth,
  exportMyData,
  googleAuth,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/saved-booths/:boothId", protect, toggleSavedBooth);
router.get("/export-data", protect, exportMyData);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.delete("/account", protect, deleteMyAccount);

module.exports = router;
