const fs = require("fs/promises");
const path = require("path");
const filePath = path.resolve("./models/contacts.json");
const { nanoid } = require("nanoid");
const listContacts = async () => {
	const data = await fs.readFile(filePath);
	const contacts = JSON.parse(data);
	return contacts;
};

const getContactById = async (contactId) => {
	const contacts = await listContacts();
	const contact = contacts.find((item) => item.id === contactId);
	return contact || null;
};

const removeContact = async (contactId) => {
	const contacts = await listContacts();
	const idx = contacts.findIndex((item) => item.id === contactId);

	if (idx === -1) {
		return null;
	}
	const deletedContact = contacts.filter((_, index) => index !== idx);
	await fs.writeFile(filePath, JSON.stringify(deletedContact));

	return contacts[idx];
};

const addContact = async ({ name, email, phone }) => {
	const contacts = await listContacts();
	const newContact = {
		id: nanoid(),
		name,
		email,
		phone,
	};
	contacts.push(newContact);
	await fs.writeFile(filePath, JSON.stringify(contacts));
	return newContact;
};

const updateContact = async (contactId, { name, email, phone }) => {
	const contacts = await listContacts();
	const idx = contacts.findIndex((item) => item.id === contactId);

	if (idx === -1) {
		return null;
	}
	contacts[idx] = { id: contactId, name, email, phone };
	await fs.writeFile(filePath, JSON.stringify(contacts));
	return contacts[idx];
};

module.exports = {
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};
