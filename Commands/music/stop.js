const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'stop',
	aliases: ['dc', 'leave'],
	description: 'Stop the music',
	example: '',
	category: 'music',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		// Get Queue
		const queue = await bot.Music.getQueue(message.guild.id);
		const member = queue.metadata.executor;

		// Checks
		if (!member.voice.channel)
			return message.reply(`${message.member} You cannot stop the music when not in a voice channel.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (message.guild.me.voice.channel && member.voice.channel.id !== message.guild.me.voice.channel.id)
			return message.reply(`${message.member} You are not in the same voice channel as me.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (!queue)
			return message.reply(`${message.member} No music is currently playing.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});

		// Embed
		const embed = new MessageEmbed().setColor(settings.guildcolor).setDescription(`${member} stopped the music.`);

		// Stop
		const success = await queue.destroy();
		if (success) {
			await queue.metadata.channel.send({ embeds: embed }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			return queue.currentEmbed.delete();
		}
	},
};
