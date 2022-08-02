const { Twitter } = require('../../Storage/Database/models');

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
		const guildWatchList = await Twitter.find({ guildid: message.guild.id }).lean();
		console.log(guildWatchList);
	},
};
