const { MessageEmbed } = require('discord.js');

module.exports = async (bot, queue) => {
	// Define
	const settings = await bot.getGuild(queue.guild);
	const message = queue.metadata;

	// Setup Embed
	const embed = new MessageEmbed().setColor(settings.guildcolor).setDescription('Queue is now Empty!');
	message.channel.send({ embeds: [embed] }).then((s) => {
		if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
	});
};
