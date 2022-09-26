const express = require("express");
const { isValidObjectId } = require("mongoose");
const { NotFound, BadRequest } = require("http-errors");
const router = express.Router();
const Joi = require("joi");
const Contact = require("../../models/contact");
const addSchema = Joi.object({
	name: Joi.string().min(5).max(40).required(),
	email: Joi.string().required(),
	phone: Joi.string().required(),
	favorite: Joi.boolean(),
});
const updateFavoriteSchema = Joi.object({
	favorite: Joi.boolean().required(),
});

router.get("/", async (_, res, next) => {
	try {
		const contactList = await Contact.find();
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
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const contact = await Contact.findById({ _id: contactId });
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
		const { error } = addSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const newContact = await Contact.create(req.body);
		res.status(201).json(newContact);
	} catch (error) {
		next(error);
	}
});

router.delete("/:contactId", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const contact = await Contact.findByIdAndRemove(contactId);
		console.log(contact);
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
		const { error } = addSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { contactId } = req.params;
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const updatedContact = await Contact.findByIdAndUpdate(
			contactId,
			req.body,
			{ new: true }
		);
		if (!updatedContact) {
			throw new NotFound(`Contact with Id=${contactId} not found`);
		}
		res.json(updatedContact);
	} catch (error) {
		next(error);
	}
});

router.patch("/:contactId/favorite", async (req, res, next) => {
	try {
		const { error } = updateFavoriteSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { contactId } = req.params;
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const updatedContact = await Contact.findByIdAndUpdate(
			contactId,
			req.body,
			{ new: true }
		);
		if (!updatedContact) {
			throw new NotFound(`Contact with Id=${contactId} not found`);
		}
		res.json(updatedContact);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
