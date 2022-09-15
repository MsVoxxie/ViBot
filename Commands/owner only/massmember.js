const { userData } = require('../../Storage/Database/models/');

module.exports = {
	name: 'massmember',
	aliases: ['mass'],
	description: 'Call something on Every member of Every Guild',
	example: ':)',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		for await (const g of bot.guilds.cache) {
			const guild = g[1];
			const members = await guild.members.fetch();
			for await (const m of members) {
			}
		}
	},
};
