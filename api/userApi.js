const express = require("express");
const router = express.Router();
const validate = require("../common/validator.js");
const ctrlUser = require("../controller/userController.js");
const auth = require("../config/authMiddleware.js");

router.post("/signup", validate.findUserByEmail, ctrlUser.signUp);
router.post("/login", validate.findUserByEmail, ctrlUser.login);
router.get("/logout", auth, ctrlUser.logout);
router.get("/current", auth, ctrlUser.currentUser);
router.patch("/", auth, validate.updateSubscription, ctrlUser.updateSubs);

module.exports = router;
