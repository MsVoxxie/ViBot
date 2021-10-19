const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'loop',
	aliases: [],
	description: 'Set the current song to loop',
	example: '',
	category: 'music',
	args: false,
	cooldown: 2,
	hidden: true,
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

		// Declare args
		const cmd = args.join(' ');

		// Setup Embed
		const embed = new MessageEmbed().setColor(settings.guildcolor);

		switch (cmd.toLowerCase()) {
			case 'queue':
				if (queue.repeatMode) {
					queue.setRepeatMode(3);
					embed.setDescription(`${message.author} Disabled Queue Repeat Mode.`);
					await message.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} else {
					queue.setRepeatMode(2);
					embed.setDescription(`${message.author} Enabled Queue Repeat Mode.`);
					await message.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;

			default:
				if (queue.repeatMode) {
					queue.setRepeatMode(3);
					embed.setDescription(`${message.author} Disabled Song Repeat Mode.`);
					await message.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} else {
					queue.setRepeatMode(1);
					embed.setDescription(`${message.author} Enabled Song Repeat Mode.`);
					await message.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
		}
	},
};
