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
	async execute(bot, message, args, settings) {
		const data = await bot.getReactions(message.guild);
		const roles = await data.reactionRoles;
		const ch = await roles.map(reaction => reaction['channel']);
		const val = await roles.map(reaction => reaction['reaction']);
		console.log(ch);
		console.log(val);
	},
};