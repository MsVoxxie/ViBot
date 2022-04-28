const { Vimotes } = require("../../Storage/Functions/miscFunctions");

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
		const member = await message.member;
		const flags = await member.user.fetchFlags();
		const send = flags.toArray().map(flag => `${Vimotes[`${flag}`]}`).join(' ');
		message.channel.send(send);
	},
};
