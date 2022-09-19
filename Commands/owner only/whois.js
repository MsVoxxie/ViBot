
module.exports = {
	name: 'whois',
	aliases: ['who'],
	description: 'testing',
	example: 'whois',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		const guild = await bot.guilds.cache.get(args[0]);
        message.reply(guild.name)
	},
};
