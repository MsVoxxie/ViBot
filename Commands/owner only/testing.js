const { userData } = require('../../Storage/Database/models/');

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
		const userRoles = await userData.findOne({ guildid: message.guild.id, userid: message.author.id })
		console.log(userRoles.userroles.map((r) => { if(r !== message.guild.id) { return `<@&${r}>` } }).filter(x => x !== undefined).join(' **|** '))
	},
};
