const express = require("express");
const router = express.Router();
const validate = require("../common/validator.js");
const ctrlUser = require("../controller/userController.js");
const authMiddleware = require("../config/authMiddleware.js");
const multer = require("multer");
const path = require("path");
// const jimp = require("jimp");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmp");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage: storage });

router.post("/signup", validate.findUserByEmail, ctrlUser.signUp);
router.post("/login", validate.findUserByEmail, ctrlUser.login);
router.get("/logout", authMiddleware.authenticate(), ctrlUser.logout);
router.get("/current", authMiddleware.authenticate(), ctrlUser.currentUser);
router.patch(
  "/",
  authMiddleware.authenticate(),
  validate.updateSubscription,
  ctrlUser.updateSubs
);
router.patch(
  "/avatars",
  authMiddleware.authenticate(),
  upload.single("avatar"),
  ctrlUser.updateAvatar
);

router.get("/verify/:verificationToken", ctrlUser.verifyEmail);
router.post("/verify/resend", ctrlUser.resendVerificationEmail);

module.exports = router;
