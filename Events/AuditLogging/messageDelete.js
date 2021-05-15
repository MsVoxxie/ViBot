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

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Deleted')
			.setDescription(`**Author› ** <@${message.author.id}> | **${message.author.tag}**
            **Channel› ** <#${message.channel.id}> | **${message.channel.name}**
            ${message.content.length > 0 ? `\n**Deleted Message› **\n\`\`\`${message.content.replace(/`/g, '\'')}\`\`\`` : ''}
            ${message.attachments.size > 0 ? `**Attachment URL› **\n[Link Here](${message.attachments.map(a => a.proxyURL)})` : ''}`)
			.setColor(settings.guildColor)
			.setImage(message.attachments.map(a => a.proxyURL)[0], { dynamic: true })
			.setFooter(`Deleted› ${bot.Timestamp(message.createdAt)}`);

		logChannel.send({ embed: embed });
	},
};