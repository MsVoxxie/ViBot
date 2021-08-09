const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, query) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setDescription(`No Results found for \`${query}\`!`);
	message.channel.send({ embeds: embed }).then((s) => {if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);});
};