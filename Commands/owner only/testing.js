const { Invite } = require('../../Storage/Database/models/');

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
		//Get current invites
		const newInvites = await message.guild.invites.fetch();
		const oldInvites = await Invite.find({ guildid: message.guild.id }).lean();

		const invite = newInvites.find(i => i.uses > oldInvites.find(o => o.invitecode === i.code).uses)

		// oldInvites.find(i => {
		// 	console.log(i.uses)
		// })

		// console.log(oldInvites.find(old => old.invitecode ==='8VH65FKEWy'))

		console.log(invite.code);
	},
};
