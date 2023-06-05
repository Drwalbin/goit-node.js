const express = require("express");
const router = express.Router();

const {
  addContact,
  listContacts,
  getContactById,
  removeContact,
  updateContact,
} = require("../../models/contacts.js");


const validate = require("../../common/validator.js");

router.get("/", async (req, res, next) => {
  const contacts = await listContacts();

  res.json({
    status: "success",
    code: 200,
    data: { contacts },
  });
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contacts = await getContactById(contactId);
  if (contacts) {
    res.json({ status: "success", code: 200, data: { contacts } });
  } else {
    res.json({
      status: console.error(Error),
      code: 404,
      message: "Not found",
    });
  }
});

router.post("/", validate.contactValid, async (req, res, next) => {
  // const { name, email, phone } = req.body;
  const newContact = await addContact(req.body);
  res.json({ status: "success", code: 201, data: { newContact } });
});

router.put("/:contactId", validate.contactUpdate, async (req, res, next) => {
  const { contactId } = req.params;
  const contactToEdit = await updateContact(contactId, req.body);

  if (!contactToEdit) {
    res.json({
      code: 404,
      message: "Not found",
    });
  } else {
    res.json({
      status: "success",
      code: 200,
      data: {
        contactToEdit,
      },
      message: "Contact has been updated successfully",
    });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await removeContact(contactId);
  if (contact) {
    res.json({
      status: "success",
      code: 200,
      message: "contact deleted",
    });
  } 
});

module.exports = router
