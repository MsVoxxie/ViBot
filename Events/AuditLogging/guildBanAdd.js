const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildBanAdd',
	disabled: false,
	once: false,
	async execute(guild, user, bot, Vimotes) {
		// If Partial, Fetch
		if (guild.partial) {
			await guild.fetch();
		}

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		const member = await guild.members.cache.get(user.id);

		// Setup Embed
		const embed = new MessageEmbed()
			.setAuthor({ name: `${member.nickname ? `${member.nickname} | ${user.tag}` : user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
			.setDescription(`${Vimotes['BAN_HAMMER']} <@${user.id}> was Banned **<t:${Math.round(Date.now() / 1000)}:R>**.`)
			.setColor(settings.guildcolor)
			.setFooter({ text: bot.Timestamp(member.joinedAt) });

		logChannel.send({ embeds: [embed] });
	},
};
