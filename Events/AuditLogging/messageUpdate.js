const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageUpdate',
	disabled: false,
	once: false,
	async execute(oldMessage, newMessage, bot) {

		// Declarations / Checks
		const settings = await bot.getGuild(oldMessage.guild);
		if(settings.audit === false) return;
		if(oldMessage.author.bot) return;
		if(oldMessage.channel.type !== 'text') return;
		if (oldMessage.content === newMessage.content) return;
		const logChannel = await oldMessage.guild.channels.cache.get(settings.auditchannel);

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Updated')
			.setDescription(`**Author› ** <@${oldMessage.author.id}> | **${oldMessage.author.tag}**
            **Channel› ** <#${oldMessage.channel.id}> | **${oldMessage.channel.name}**
            **Message Link› ** [Jump To Message](${newMessage.url})
            
            **Original Message› **
            \`\`\`${oldMessage.content.replace(/`/g, '\'')}\`\`\`

            **Updated Message› **
            \`\`\`${newMessage.content.replace(/`/g, '\'')}\`\`\``)
			.setColor(settings.guildColor)
			.setFooter(`Updated› ${bot.Timestamp(newMessage.createdAt)}`);

		logChannel.send({ embed: embed });
	},
};