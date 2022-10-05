const express = require("express");
const { isValidObjectId } = require("mongoose");
const { NotFound, BadRequest } = require("http-errors");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const Contact = require("../../models/contact");
const auth = require("../../middlewares/auth");
const { SECRET_KEY } = process.env;
const router = express.Router();
const addSchema = Joi.object({
	name: Joi.string().min(5).max(40).required(),
	email: Joi.string().required(),
	phone: Joi.string().required(),
	favorite: Joi.boolean(),
});
const updateFavoriteSchema = Joi.object({
	favorite: Joi.boolean().required(),
});

router.get("/", auth, async (req, res, next) => {
	try {
		const { _id } = req.user;
		const { page = 1, limit = 10, favorite } = req.query;
		const skip = (page - 1) * 10;
		const contactList = await Contact.find(
			favorite ? { owner: _id, favorite } : { owner: _id },
			"",
			{
				skip,
				limit: +limit,
			}
		).populate("owner", "_id, email");
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

router.get("/:contactId", auth, async (req, res, next) => {
	try {
		const { authorization = "" } = req.headers;
		const [token] = authorization.split(" ").slice(1);
		const { id } = jwt.verify(token, SECRET_KEY);
		const { contactId } = req.params;
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const contact = await Contact.findById({ _id: contactId });
		if (!contact) {
			throw new NotFound(`Contact with Id=${contactId} not found`);
		}
		if (id !== contact.owner._id) {
			throw new NotFound(
				`Contact with Id=${contactId} not found in your collection`
			);
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

router.post("/", auth, async (req, res, next) => {
	try {
		const { error } = addSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { _id } = req.user;
		const newContact = await Contact.create({ ...req.body, owner: _id });
		res.status(201).json(newContact);
	} catch (error) {
		next(error);
	}
});

router.delete("/:contactId", auth, async (req, res, next) => {
	try {
		const { _id } = req.user;
		const { contactId } = req.params;
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const contact = await Contact.findOneAndDelete({
			contactId,
			owner: _id,
		});

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

router.put("/:contactId", auth, async (req, res, next) => {
	try {
		const { error } = addSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { _id } = req.user;
		const { contactId } = req.params;
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const updatedContact = await Contact.findOneAndUpdate(
			{
				contactId,
				owner: _id,
			},
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

router.patch("/:contactId/favorite", auth, async (req, res, next) => {
	try {
		const { error } = updateFavoriteSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { _id } = req.user;
		const { contactId } = req.params;
		const isValideId = isValidObjectId(contactId);
		if (!isValideId) {
			throw new BadRequest(`Id - ${contactId} is not valid`);
		}
		const updatedContact = await Contact.findOneAndUpdate(
			{
				contactId,
				owner: _id,
			},
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
