const { Schema, model } = require("mongoose");

const userShema = new Schema(
	{
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
		},
		subscription: {
			type: String,
			enum: ["starter", "pro", "business"],
			default: "starter",
		},
		token: {
			type: String,
			default: null,
		},
		avatarURL: {
			type: String,
			required: true,
		},

		verify: {
			type: Boolean,
			default: false,
		},
		verificationToken: {
			type: String,
			required: [true, "Verify token is required"],
		},
	},
	{ versionKey: false }
);

const handleErrors = (error, _, next) => {
	const { name, code } = error;
	if (name === "MongoServerError" && code === 11000) {
		error.status = 409;
	} else {
		error.status = 400;
	}

	next();
};
userShema.post("save", handleErrors);
const User = model("user", userShema);
module.exports = User;
