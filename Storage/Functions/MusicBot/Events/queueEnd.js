const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, queue) => {

	// Define
	const settings = await bot.getGuild(message.guild);
	const trackEmbed = await queue.currentEmbed;

	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setDescription('Queue is now Empty!');
	message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});

	if(trackEmbed && !trackEmbed.deleted) return trackEmbed.delete();

};