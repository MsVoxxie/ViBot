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
		const member = queue.metadata.executor;

		// Checks
		if (!member.voice.channel)
			return message.reply(`${message.member} You cannot loop the music when not in a voice channel.`).then((s) => {
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

		// Declare args
		const cmd = args.join(' ');

		// Setup Embed
		const embed = new MessageEmbed().setColor(settings.guildcolor);

		switch (cmd.toLowerCase()) {
			case 'queue':
				if (queue.repeatMode === 2) {
					queue.setRepeatMode(3);
					embed.setDescription(`${member} Disabled Queue Repeat Mode.`);
					await queue.metadata.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} else {
					queue.setRepeatMode(2);
					embed.setDescription(`${member} Enabled Queue Repeat Mode.`);
					await queue.metadata.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;

			default:
				if (queue.repeatMode === 1) {
					queue.setRepeatMode(3);
					embed.setDescription(`${member} Disabled Song Repeat Mode.`);
					await queue.metadata.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} else {
					queue.setRepeatMode(1);
					embed.setDescription(`${member} Enabled Song Repeat Mode.`);
					await queue.metadata.channel.send({ embeds: [embed] }).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
		}
	},
};
