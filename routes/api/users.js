const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const {
	BadRequest,
	Conflict,
	Unauthorized,
	NotFound,
	Forbidden,
} = require("http-errors");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");

const avatarResizing = require("../../helpers/avatarResizing");
const sendEmail = require("../../helpers/sendEmail");
const { SECRET_KEY } = process.env;
const User = require("../../models/user");
const auth = require("../../middlewares/auth");
const upload = require("../../middlewares/upload");

const router = express.Router();
const userSchema = Joi.object({
	password: Joi.string().min(7).max(20).required(),
	email: Joi.string().required(),
});
const verifyEmailSchema = Joi.object({
	email: Joi.string().required(),
});
router.post("/signup", async (req, res, next) => {
	try {
		const { error } = userSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { email, password, subscription } = req.body;
		const user = await User.findOne({ email });
		if (user) {
			throw new Conflict("Email in use");
		}
		const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
		const avatarURL = gravatar.url(email);
		const verificationToken = nanoid();
		await User.create({
			email,
			password: hashPassword,
			subscription,
			avatarURL,
			verificationToken,
		});
		const mail = {
			to: email,
			subject: "Підтвердження реєстрації",
			html: `<a href="http://localhost:3000/api/users/verify/${verificationToken}" target="_blank">Натисніть для підтвердження</a>`,
		};
		await sendEmail(mail);
		res.status(201).json({
			status: "succsess",
			code: 201,
			data: {
				user: {
					email,
					subscription,
					avatarURL,
				},
			},
		});
	} catch (error) {
		next(error);
	}
});

router.post("/login", async (req, res, next) => {
	try {
		const { email, password, subscription } = req.body;

		const user = await User.findOne({ email });

		if (!user || !bcrypt.compareSync(password, user.password)) {
			throw new Unauthorized("Email or password is wrong");
		}
		if (!user.verify) {
			throw new Forbidden("Email not verify");
		}
		const payload = {
			id: user._id,
		};
		const token = jwt.sign(payload, SECRET_KEY);
		await User.findByIdAndUpdate(user._id, { token });
		res.json({
			status: "succsess",
			code: 200,
			data: {
				token,
				user: {
					email,
					subscription,
				},
			},
		});
	} catch (error) {
		next(error);
	}
});

router.post("/logout", auth, async (req, res, next) => {
	try {
		const { _id } = req.user;
		const user = await User.findByIdAndUpdate(_id, { token: null });
		if (!user) {
			throw new Unauthorized("Not authorized");
		}
		res.status(204).json();
	} catch (error) {
		next(error);
	}
});

router.get("/current", auth, async (req, res, next) => {
	const { email, subscription } = req.user;
	res.json({
		status: "succsess",
		code: 200,
		data: {
			email,
			subscription,
		},
	});
});

router.patch(
	"/avatars",
	auth,
	upload.single("avatar"),
	async (req, res, next) => {
		const { _id } = req.user;
		const { path: tempUpload, originalname } = req.file;
		const avatarsDir = path.join(__dirname, "../../", "public", "avatars");
		const imgName = `${_id}_${originalname}`;

		try {
			const resultUpload = path.join(avatarsDir, imgName);
			await fs.rename(tempUpload, resultUpload);

			const avatarURL = path.join("public", "avatars", imgName);
			avatarResizing(avatarURL);
			await User.findByIdAndUpdate(_id, { avatarURL });
			res.json(avatarURL);
		} catch (error) {
			await fs.unlink(tempUpload);
			next(error);
		}
	}
);

router.patch("/verify/:verificationToken", async (req, res, next) => {
	const { verificationToken } = req.params;
	try {
		const user = await User.findOne({ verificationToken });
		if (!user) {
			throw new NotFound("Not found");
		}
		await User.findByIdAndUpdate(user._id, {
			verify: true,
			verificationToken: "",
		});
		res.json({
			message: "Verification successful",
		});
	} catch (error) {
		next(error);
	}
});

router.post("/verify", async (req, res, next) => {
	const { error } = verifyEmailSchema.validate(req.body);
	if (error) {
		throw new BadRequest("missing required field email");
	}
	const { email } = req.body;
	const user = await User.findOne({ email });
	if (!user) {
		throw new NotFound("Not found");
	}
	if (user.verify) {
		throw new BadRequest("Verification has already been passed");
	}
	const mail = {
		to: email,
		subject: "Підтвердження реєстрації",
		html: `<a href="http://localhost:3000/api/users/verify/${user.verificationToken}" target="_blank">Натисніть для підтвердження</a>`,
	};
	await sendEmail(mail);
	res.json({
		status: "succsess",
		code: 200,
		message: "Verification email sent",
	});
});
module.exports = router;
