const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, track) => {
	const settings = await bot.getGuild(message.guild);
	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setAuthor(`Requested By› ${track.requestedBy.tag}`, track.requestedBy.displayAvatarURL({ dynamic: true }))
		.setThumbnail(track.thumbnail)
		.setDescription(`**Now Playing›** [${track.title}](${track.url})\n**Song Duration›** \`${track.durationMS > 10 ? track.duration : 'Live Stream'}\`\n**Channel›** ${message.guild.me.voice.channel}\n`)
		.setFooter(bot.Timestamp(Date.now()));
	message.channel.send({ embed: embed }).then(s => {if(settings.audit) s.delete({ timeout: track.durationMS > 10 ? track.durationMS : 360 * 1000 });});
};