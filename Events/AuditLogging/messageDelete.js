const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'messageDelete',
	disabled: false,
	once: false,
	async execute(message, bot) {
		// check if partial
		if (message.partial) return;
		if (!message.guild) return;

		// Declarations / Checks
		const settings = await bot.getGuild(message.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		if (message.author.bot) return;
		if (message.channel.type !== 'GUILD_TEXT') return;
		const logChannel = await message.guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;
		let LogTarget;

		//Wait!
		await bot.sleep(5000);

		//Fetch Audit Log
		const fetchedLogs = await message.guild.fetchAuditLogs({
			limit: 1,
			type: 'MESSAGE_DELETE',
		});

		const Log = await fetchedLogs.entries.first();
		const { executor, target } = Log;

		if (target.id === message.author.id) {
			LogTarget = executor.tag;
		} else {
			LogTarget = `${message.author.tag} or A Bot`;
		}

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Deleted')
			.setDescription(`**Author›** <@${message.author.id}> | **${message.author.tag}**\n${LogTarget ? `**Deleted By›** **${LogTarget}**` : ''}\n**Channel›** <#${message.channel.id}> | **${message.channel.name}**\n**Deleted›** **<t:${Math.round(Date.now() / 1000)}:R>**\n${message.content.length > 0 ? `\n**Deleted Message›**\n\`\`\`${message.content.replace(/`/g, "'")}\`\`\`` : ''}\n${message.attachments.size > 0 ? `**Attachment URL› **[Image Link](${message.attachments.map((a) => a.proxyURL)})` : ''}`)
			.setColor(settings.guildcolor)

		logChannel.send({ embeds: [embed] });
	},
};
