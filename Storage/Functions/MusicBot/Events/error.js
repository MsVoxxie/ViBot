const { MessageEmbed } = require('discord.js');

module.exports = async (bot, queue, error, message, ...args) => {
	const msg = queue.metadata.message;
	const settings = await bot.getGuild(msg.guild);

	// Generate Embed
	const embed = new MessageEmbed().setColor(settings.guildcolor);

	switch (error) {
		case 'NotPlaying':
			embed.setDescription("There isn't any music playing here.");
			msg.channel.send({ embeds: [embed] }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			break;
		case 'NotConnected':
			embed.setDescription("You're not in the same voice channel as me.");
			msg.channel.send({ embeds: [embed] }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			break;
		case 'UnableToJoin':
			embed.setDescription("I'm unable to join your voice channel, I may be missing permissions!");
			msg.channel.send({ embeds: [embed] }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			break;
		case 'VideoUnavailable':
			embed.setDescription(`It looks like ${args[0].title} is not available in my country, Skipping.`);
			msg.channel.send({ embeds: [embed] }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			break;
		case 'MusicStarting':
			embed.setDescription('Please wait, There is music waiting to start.');
			msg.channel.send({ embeds: [embed] }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			break;
		default:
			embed
				.setTitle('__**Error!**__')
				.setColor('#a83232')
				.addField('⚠️ Error»', `\`\`\`Javascript\n${error}\`\`\``, false)
				.setFooter({ text: bot.Timestamp(Date.now()) });
			msg.channel.send({ embeds: [embed] }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 60 * 1000);
			});
	}
};
