const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = async (bot, queue, playlist) => {
	const message = queue.metadata.message;
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
		.setThumbnail(playlist.setThumbnail)
		.setDescription(`**Playlist Title»** [${playlist.title}](${playlist.url})\n**Total Duration»** \`${ms(playlist.duration, { long: true })}\`\n**Total Songs»** \`${playlist.tracks.length}\``)
		.setFooter({ text: bot.Timestamp(Date.now()) });

	message.channel.send({ embeds: [embed] }).then((s) => {
		if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
	});
};
