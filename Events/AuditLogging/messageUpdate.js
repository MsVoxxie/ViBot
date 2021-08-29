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

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Updated')
			.setDescription(
				`**Author›** <@${newMessage.author.id}> | **${newMessage.author.tag}**\n**Channel›** <#${newMessage.channel.id}> | **${
					newMessage.channel.name
				}**\n**Message Link›** [Jump To Message](${newMessage.url})\n\n**Original Message›**\`\`\`${oldMessage.content.replace(
					/`/g,
					"'"
				)}\`\`\`\n\n**Updated Message›**\`\`\`${newMessage.content.replace(/`/g, "'")}\`\`\``
			)
			.setColor(settings.guildcolor)
			.setFooter(`Updated› ${bot.Timestamp(newMessage.createdAt)}`);

		logChannel.send({ embeds: [embed] });
	},
};
