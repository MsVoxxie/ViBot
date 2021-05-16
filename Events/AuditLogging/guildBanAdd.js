const { MessageEmbed } = require('discord.js');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

module.exports = {
	name: 'guildBanAdd',
	disabled: false,
	once: false,
	async execute(guild, user, bot) {

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (settings.audit === false) return;
		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		const member = await guild.members.cache.get(user.id);

		// Setup Embed
		const embed = new MessageEmbed()
			.setAuthor(`${member.nickname ? `${member.nickname} | ${user.tag}` : user.tag}`, user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${Vimotes['BAN_HAMMER']} <@${user.id}> was Banned.`)
			.setColor(settings.guildColor)
			.setFooter(bot.Timestamp(member.joinedAt));

		logChannel.send({ embed: embed });
	},
};