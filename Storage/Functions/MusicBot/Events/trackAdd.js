const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, queue, track) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setAuthor(message.member.user.tag, message.member.user.displayAvatarURL({ dynamic: true }))
		.setThumbnail(track.thumbnail)
		.setDescription(`Added [${track.title}](${track.url}) to the Queue.`)
		.setFooter(bot.Timestamp(Date.now()));
	message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
};