const Jimp = require("jimp");
const avatarResizing = async (avatarPath) => {
	try {
		const resizenAvatar = await Jimp.read(avatarPath);
		await resizenAvatar.resize(250, 250);
		await resizenAvatar.writeAsync(avatarPath);
	} catch (error) {}
};

module.exports = avatarResizing;
