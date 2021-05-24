const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageDelete',
	disabled: false,
	once: false,
	async execute(message, bot) {

		// If Partial, Fetch
		if(message.partial) { return; }

		// Declarations / Checks
		const settings = await bot.getGuild(message.guild);
		if(!settings) return;
		if(settings.audit === false) return;
		if(message.author.bot) return;
		if(message.channel.type !== 'text') return;
		const logChannel = await message.guild.channels.cache.get(settings.auditchannel);

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Deleted')
			.setDescription(`**Author›** <@${message.author.id}> | **${message.author.tag}**\n**Channel›** <#${message.channel.id}> | **${message.channel.name}**\n${message.content.length > 0 ? `\n**Deleted Message›**\n\`\`\`${message.content.replace(/`/g, '\'')}\`\`\`` : ''}\n${message.attachments.size > 0 ? `**Attachment URL› **\n[Link Here](${message.attachments.map(a => a.proxyURL)})` : ''}`)
			.setColor(settings.guildcolor)
			.setImage(message.attachments.map(a => a.proxyURL)[0], { dynamic: true })
			.setFooter(`Deleted› ${bot.Timestamp(message.createdAt)}`);

		logChannel.send({ embed: embed });
	},
};