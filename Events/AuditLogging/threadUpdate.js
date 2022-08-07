const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'threadUpdate',
	disabled: false,
	once: false,
	async execute(oldThread, newThread, bot, Vimotes) {
		// check if partial
		if (newThread.partial) return;
		if (!newThread.archived) return;
		// Declarations / Checks
		const settings = await bot.getGuild(newThread.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await newThread.guild.channels.cache.get(settings.auditchannel);

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setTitle(`Thread Archived`)
			.setDescription(`**Thread Parent»** ${oldThread.parent.name}\n**Thread Name»** ${newThread.name}`)
			.setFooter({ text: `Archived» ${bot.Timestamp(newThread.archivedAt)}` });

		logChannel.send({ embeds: [embed] });
	},
};
