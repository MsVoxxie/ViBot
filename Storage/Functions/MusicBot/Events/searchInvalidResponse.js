const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, query, tracks, content, collector) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor);

	if(content === 'cancel') {
		collector.stop();
		embed.setDescription('Search Cancelled.');
		return message.channel.send({ embeds: [embed] }).then((s) => {if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);});
	}
	else{
		embed.setDescription(`Invalid Query, You must send a number between (1 - ${tracks.length})!`);
		return message.channel.send({ embeds: [embed] }).then((s) => {if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);});
	}
};