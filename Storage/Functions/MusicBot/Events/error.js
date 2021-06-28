const { MessageEmbed } = require('discord.js');

module.exports = async (bot, error, message, ...args) => {

	const settings = await bot.getGuild(message.guild);

	// Generate Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor);

	switch (error) {
	case 'NotPlaying':
		embed.setDescription('There isn\'t any music playing here.');
		message.channel.send({ embed:embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
		break;
	case 'NotConnected':
		embed.setDescription('You\'re not in the same voice channel as me.');
		message.channel.send({ embed:embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
		break;
	case 'UnableToJoin':
		embed.setDescription('I\'m unable to join your voice channel, I may be missing permissions!');
		message.channel.send({ embed:embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
		break;
	case 'VideoUnavailable':
		embed.setDescription(`It looks like ${args[0].title} is not available in my country, Skipping.`);
		message.channel.send({ embed:embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
		break;
	case 'MusicStarting':
		embed.setDescription('Please wait, There is music waiting to start.');
		message.channel.send({ embed:embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
		break;
	default:
		embed.setDescription(`Something went wrong...\n**Error›** ${error}`);
		message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
	}
};