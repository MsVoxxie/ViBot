const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, query, tracks) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setDescription(`${tracks.map((t, i) => `**${i + 1}** - ${t.title}`).join('\n')}`);
	message.channel.send({ embeds: [embed] }).then((s) => {if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);});
};