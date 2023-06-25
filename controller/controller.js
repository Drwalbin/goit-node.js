const service = require("../service/service.js");
const paginatedResults = require("../common/pagination.js");

const get = async (req, res, next) => {
  try {
    let results = await service.getAllContacts();
    const { favorite, page, limit } = req.query;

    if (favorite) {
      results = await service.getAllContacts({ favorite: favorite });
    }
    if (page && limit) {
      results = await res.paginatedResults;
    }
    res.status(200).json(results);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getById = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await service.getContactById(contactId);
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contacts: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${contactId}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const addContact = async (req, res, next) => {
  try {
    const result = await service.createContact(req.body);
    if (result) {
      res.json({
        status: "success",
        code: 201,
        data: { contacts: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await service.updateContact(contactId, req.body);
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contacts: result },
        message: "Contact has been updated successfully",
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Contact not found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateContactStatus = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await service.updateStatusContact(
      contactId,
      req.body.favorite
    );
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contacts: result },
        message: "Contact has been updated successfully",
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Contact not found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await service.removeContact(contactId);
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contacts: result },
        message: "Contact deleted",
      });
    } else {
      res.status(404).json({
        status: "failure",
        code: 404,
        message: "Contact not found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = {
  get,
  getById,
  addContact,
  updateContact,
  deleteContact,
  updateContactStatus,
};
