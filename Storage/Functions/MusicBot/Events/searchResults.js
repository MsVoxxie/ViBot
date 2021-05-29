const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, query, tracks) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setDescription(`${tracks.map((t, i) => `**${i + 1}** - ${t.title}`).join('\n')}`);
	message.channel.send({ embed: embed }).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
};