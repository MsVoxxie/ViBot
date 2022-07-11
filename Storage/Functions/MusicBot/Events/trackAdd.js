const { MessageEmbed } = require('discord.js');

module.exports = async (bot, queue, track) => {
	const message = await queue.metadata.message;
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setAuthor({ name: message.member.user.tag, iconURL: message.member.user.displayAvatarURL({ dynamic: true }) })
		.setThumbnail(track.thumbnail)
		.setDescription(`Added [${track.title}](${track.url}) to the Queue.`)
		.setFooter({ text: bot.Timestamp(Date.now()) });
	queue.metadata.channel.send({ embeds: [embed] }).then((s) => {
		if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
	});
};
