const express = require("express");
const router = express.Router();
const validate = require("../common/validator.js");
const ctrlContact = require("../controller/controller.js");

router.get("/contacts", ctrlContact.get);

router.get("/contacts/:contactId", ctrlContact.getById);

router.post("/contacts", validate.createContact, ctrlContact.addContact);

router.delete("/contacts/:contactId", ctrlContact.deleteContact);

router.put(
  "/contacts/:contactId",
  validate.updateContact,
  ctrlContact.updateContact
);

router.patch(
  "/contacts/:contactId/favorite",
  validate.updateStatus,
  ctrlContact.updateContactStatus
);

module.exports = router;
