const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'test',
	aliases: ['t'],
	description: 'testing',
	example: 'testing',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		// const URL = 'https://discord.com/assets/9f6f9cd156ce35e2d94c0e62e3eff462.png';
		// const attachment1 = new MessageAttachment(URL, `media.mp4`);
		// const attachment2 = new MessageAttachment(URL, `logo.png`);

		// const embed = new MessageEmbed().setImage(URL).setThumbnail(URL);

		// const msg = await message.channel.send({
		// 	content: URL,
		// 	files: [attachment1, attachment2],
		// 	embeds: [embed],
		// });
		const ref = await bot.getReference(message);
		console.log(ref, ref.content);
	},
};
