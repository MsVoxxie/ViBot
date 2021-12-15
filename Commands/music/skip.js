const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'skip',
	aliases: ['sk'],
	description: 'Skip the currently playing song',
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
		// Checks
		if (!message.member.voice.channel)
			return message.reply('You cannot stop the music when not in a voice channel.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id)
			return message.reply('You are not in the same voice channel as me.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (!queue)
			return message.reply('No music is currently playing.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});

		// Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setDescription(`${message.member} skipped the song.`);

		const success = await queue.skip();
		await queue.currentEmbed.delete();
		if (success) {
			await message.channel.send({ embeds: [embed] }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			return queue.currentEmbed.delete();
		}
	},
};
