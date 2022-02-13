const mongoose = require('mongoose');
const { UserData } = require('../../Storage/Database/models/');

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
		await UserData.findOneAndUpdate(
			{ guildid: message.guild.id, userid: message.member.user.id },
			{
				userroles: message.member.roles.cache.map((r) => r.id),
			},
			{ new: true, upsert: true }
		);
		mongoose.UserData.createIndexes({ createdAt: 1 }, { expireAfterSeconds: 60 });
	},
};
