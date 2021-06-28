const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = async (bot, message, queue, playlist) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setAuthor(message.member.user.tag, message.member.user.displayAvatarURL({ dynamic: true }))
		.setThumbnail(playlist.setThumbnail)
		.setDescription(`**Playlist Title›** [${playlist.title}](${playlist.url})\n**Total Duration›** \`${ms(playlist.duration, { long: true })}\`\n**Total Songs›** \`${playlist.tracks.length}\``)
		.setFooter(bot.Timestamp(Date.now()));

	message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
};