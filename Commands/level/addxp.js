const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'addxp',
	aliases: [],
	description: 'Give XP to a member',
	example: 'addxp <amount> <member>',
	category: 'level',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		//Declarations
		let Getmember = (await message.mentions.members.first()) || (await message.member);
		const member = await message.guild.members.fetch(Getmember.id);
		const levelChannel = await message.guild.channels.cache.get(settings.levelchannel);
		if (!levelChannel)
			return message.reply('The leveling system is not enabled on this server.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 60 * 60 * 1000);
			});
		const xpToAdd = parseInt(args[0]);
		if (isNaN(xpToAdd))
			return message.reply(`you need to specify a number of XP to give!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 60 * 60 * 1000);
			});

		//Grant XP
		await bot.addXP(message.guild, member, xpToAdd, bot, settings, levelChannel, message);
		await message.reply(`Granted ${xpToAdd} XP to ${member.user.tag}`);
	},
};
