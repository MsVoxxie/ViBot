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
		const guild = message.guild;
		//Get Channels
		const channels = await guild.channels.cache
			.filter((ch) => ch.type === 'GUILD_VOICE')
			.filter(function (x) {
				return x !== undefined;
			});

		//Loop Channels
		await channels.forEach(async (chan) => {
			const channel = await bot.channels.cache.get(chan.id);
			if (channel.id === guild.afkChannelId) return;
			const members = await channel.members;
			if (members.size <= 1) return console.log('Channel has less than 2 members, skipping.');

			//Loop Members
			for await (const mem of members) {
				const member = mem[1];
				console.log(member.user.tag);
				if (member.user.bot) return;
				if (bot.Debug) console.log(`Granting ${xpToAdd} Voice XP to ${member.displayName}`);
				await bot.addXP(guild, member, xpToAdd, bot, settings, levelChannel);
			}
		});
	},
};
