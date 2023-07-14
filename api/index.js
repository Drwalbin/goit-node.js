const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const validate = require("../common/validator.js");
const ctrlContact = require("../controller/controller.js");
const auth = require("../config/authMiddleware");
const Contact = require("../service/schemas/contact.js");
const paginatedResults = require("../common/pagination.js");

router.get(
  "/",
  auth.authenticate(),
  paginatedResults(Contact),
  ctrlContact.get
);
router.get("/:contactId", ctrlContact.getById);
router.post(
  "/",
  auth.authenticate(),
  validate.createContact,
  ctrlContact.addContact
);
router.delete("/:contactId", ctrlContact.deleteContact);
router.put("/:contactId", validate.updateContact, ctrlContact.updateContact);
router.patch(
  "/:contactId/favorite",
  validate.updateStatus,
  ctrlContact.updateContactStatus
);
router.patch("/avatars", userController.updateAvatar);

module.exports = router;
