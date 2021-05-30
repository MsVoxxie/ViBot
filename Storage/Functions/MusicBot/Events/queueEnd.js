const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, queue) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setDescription('Queue is now Empty!');
	message.channel.send({ embed: embed }).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
};