const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildBanAdd',
	disabled: false,
	once: false,
	async execute(ban, bot, Vimotes) {
		const guild = ban.guild;
		const member = await guild.members.fetch(ban.user.id);

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
			.setAuthor({ name: `${member.nickname ? `${member.nickname} | ${member.user.tag}` : member.user.tag}`, iconURL: member.displayAvatarURL({ dynamic: true }) })
			.setDescription(`${Vimotes['BAN_HAMMER']} **<@${member.id}> | ${member.user.tag}** was Banned **<t:${Math.round(Date.now() / 1000)}:R>**.\n**Reason›** ${ban.reason ? ban.reason : 'No Reason Given'}`)
			.setColor(settings.guildcolor)
			.setFooter({ text: bot.Timestamp(member.joinedAt) });

		logChannel.send({ embeds: [embed] });
	},
};
