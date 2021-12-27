const { MessageEmbed } = require('discord.js');

module.exports = async (bot, queue) => {
	// Define
	const settings = await bot.getGuild(queue.guild);
	const message = queue.metadata;

	// Setup Embed
	const embed = new MessageEmbed().setColor(settings.guildcolor).setDescription(`Queue is now Empty!\nDisconnecting from <#${message.voice_channel.id}>`).setFooter(bot.Timestamp(Date.now()));
	await message.channel.send({ embeds: [embed] }).then((s) => {
		if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
	});
	if (queue.currentEmbed) {
		if (settings.prune) setTimeout(() => queue.currentEmbed.delete(), 5 * 1000);
	}
};
