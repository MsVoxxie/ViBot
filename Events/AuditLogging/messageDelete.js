const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageDelete',
	disabled: false,
	once: false,
	async execute(message, bot) {

		// Declarations / Checks
		const settings = await bot.getGuild(message.guild);
		if(settings.audit === false) return;
		if(message.author.bot) return;
		if(message.channel.type !== 'text') return;
		const logChannel = await message.guild.channels.cache.get(settings.auditchannel);

		// Grab Audit Log Data
		const fetchedLogs = await message.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' }).then(audit => audit.entries.first());
		let deleter = '';
		if(fetchedLogs.extra) {
			if (fetchedLogs.extra.channel.id === message.channel.id
				&& (fetchedLogs.target.id === message.author.id)
				&& (fetchedLogs.createdTimestamp > (Date.now() - 5 * 1000))
				&& (fetchedLogs.extra.count >= 1)) {
				console.log(fetchedLogs.executeor);
				deleter = `<@${fetchedLogs.executeor.tag}> | **${fetchedLogs.executeor.tag}**`;
			}
			else{
				deleter = `<@${message.author.id}> | **${message.author.tag}**`;
			}
		}

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Deleted')
			.setDescription(`**Author› ** <@${message.author.id}> | **${message.author.tag}**
			**Deleted By› ** ${deleter ? deleter : 'Failed to Fetch user.'}
            **Channel› ** <#${message.channel.id}> | **${message.channel.name}**
            ${message.content.length > 0 ? `\n**Deleted Message› **\n\`\`\`${message.content.replace(/`/g, '\'')}\`\`\`` : ''}
            ${message.attachments.size > 0 ? `**Attachment URL› **\n[Link Here](${message.attachments.map(a => a.proxyURL)})` : ''}`)
			.setColor(settings.guildColor)
			.setImage(message.attachments.map(a => a.proxyURL)[0], { dynamic: true })
			.setFooter(`Deleted› ${bot.Timestamp(message.createdAt)}`);

		logChannel.send({ embed: embed });
	},
};