const express = require("express");
const { NotFound, BadRequest } = require("http-errors");
const router = express.Router();
const Joi = require("joi");
const schema = Joi.object({
	name: Joi.string().min(5).max(40).required(),
	email: Joi.string().required(),
	phone: Joi.string().required(),
});
const {
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
} = require("../../models/contacts");

router.get("/", async (req, res, next) => {
	try {
		const contactList = await listContacts();
		res.json({
			status: "succsess",
			code: 200,
			data: {
				result: contactList,
			},
		});
	} catch (error) {
		next(error);
	}
});

router.get("/:contactId", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const contact = await getContactById(contactId);
		if (!contact) {
			throw new NotFound(`Contact with Id=${contactId} not found`);
		}
		res.json({
			status: "succsess",
			code: 200,
			data: {
				response: contact,
			},
		});
	} catch (error) {
		next(error);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { error } = schema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const newContact = await addContact(req.body);
		res.status(201).json(newContact);
	} catch (error) {
		next(error);
	}
});

router.delete("/:contactId", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const contact = await removeContact(contactId);
		if (!contact) {
			throw new NotFound(`Contact with Id=${contactId} not found`);
		}
		res.json({
			status: "succsess",
			code: 200,
			message: "contact deleted",
			data: {
				result: contact,
			},
		});
	} catch (error) {
		next(error);
	}
});

router.put("/:contactId", async (req, res, next) => {
	try {
		const { error } = schema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { contactId } = req.params;
		const updatedContact = await updateContact(contactId, req.body);
		if (!updatedContact) {
			throw new NotFound(`Contact with Id=${contactId} not found`);
		}
		res.json(updatedContact);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
