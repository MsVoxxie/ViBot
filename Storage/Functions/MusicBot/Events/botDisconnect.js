const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, queue) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setDescription('Disconnecting from voice and clearing queue.');
	message.channel.send({ embeds: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
};