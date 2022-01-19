const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageDeleteBulk',
	disabled: false,
	once: false,
	async execute(messages, bot, Vimotes) {
		//Declarations
		const firstMessage = await messages.first();
		const settings = await bot.getGuild(firstMessage.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		if (firstMessage.channel.type !== 'GUILD_TEXT') return;
		const logChannel = await firstMessage.guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;
		const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

		//Filter messages
		const filteredMessages = messages.map((m) => {
			return `${m.author.username}› ${m.emeds ? 'Embeded Message' : m.content.replace(/`/g, "'")}`;
		});

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Messages Bulk Deleted')
			.setDescription(`**Channel›** <#${firstMessage.channel.id}> | **${firstMessage.channel.name}**\n**Deleted Messages›**\n\`\`\`${trim(filteredMessages.join('\n'),3500)}\`\`\``)
			.setColor(settings.guildcolor)
			.setFooter({ text: `Executed › ${bot.Timestamp(Date.now())}` });

		logChannel.send({ embeds: [embed] });
	},
};

//message.content.replace(/`/g, "'")
