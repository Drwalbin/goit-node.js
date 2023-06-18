const Contact = require("../service/schemas/contact.js");

const getAllContacts = async (body) => Contact.find(body);

const getContactById = async (contactId) => Contact.findOne({ _id: contactId });

const createContact = (body) => Contact.create(body);

const updateContact = (contactId, body) =>
  Contact.findByIdAndUpdate({ _id: contactId }, body, { new: true });

const updateStatusContact = (contactId, body) =>
  Contact.findByIdAndUpdate({ _id: contactId }, body, { new: true });

const removeContact = (contactId) =>
  Contact.findByIdAndRemove({ _id: contactId });

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  updateStatusContact,
  removeContact,
};
