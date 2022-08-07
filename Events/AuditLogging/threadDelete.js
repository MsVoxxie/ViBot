const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'threadDelete',
	disabled: false,
	once: false,
	async execute(threadChannel, bot, Vimotes) {
		// check if partial
		if (threadChannel.partial) return;
		// Declarations / Checks
		const settings = await bot.getGuild(threadChannel.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await threadChannel.guild.channels.cache.get(settings.auditchannel);

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setTitle(`Thread Deleted`)
			.setDescription(`**Thread Parent»** ${threadChannel.parent.name}\n**Thread Name»** ${threadChannel.name}`)
			.setFooter({ text: `Deleted ${bot.Timestamp(threadChannel.archivedAt)}` });

		logChannel.send({ embeds: [embed] });
	},
};
