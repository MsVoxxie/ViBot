const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageUpdate',
	disabled: false,
	once: false,
	async execute(oldMessage, newMessage, bot) {
		// If Partial, Fetch
		if (oldMessage.partial) {
			await newMessage.fetch();
		}

		// Declarations / Checks
		const settings = await bot.getGuild(oldMessage.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		if (newMessage.author.bot) return;
		if (newMessage.channel.type !== 'GUILD_TEXT') return;
		if (newMessage.content.toString() === oldMessage.content.toString()) return;
		const logChannel = await newMessage.guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Updated')
			.setDescription(`**Author›** <@${newMessage.author.id}> | **${newMessage.author.tag}**\n**Channel›** <#${newMessage.channel.id}> | **${newMessage.channel.name}**\n**Updated›** **<t:${Math.round(Date.now()/1000)}:R>**\n**Message Link›** [Jump To Message](${newMessage.url})\n\n**Original Message›**\n${oldMessage.content}\n\n**Updated Message›**\n${newMessage.content}`)
			.setColor(settings.guildcolor);

		logChannel.send({ embeds: [embed] });
	},
};
