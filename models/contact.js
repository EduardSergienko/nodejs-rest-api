const { Schema, model } = require("mongoose");

const contactShema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Set name for contact"],
		},
		email: {
			type: String,
		},
		phone: {
			type: String,
			unique: true,
		},
		favorite: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "user",
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
contactShema.post("save", handleErrors);
const Contact = model("contact", contactShema);
module.exports = Contact;
