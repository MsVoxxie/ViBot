const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, queue) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setDescription('Stopping Music, Voice channel is empty.');
	message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
};